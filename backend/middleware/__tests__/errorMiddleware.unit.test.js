import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EventEmitter } from 'events';
import {
  requestContext,
  requestLogger,
  notFound,
  errorHandler,
} from '../../middleware/errorMiddleware.js';

describe('errorMiddleware observability', () => {
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it('requestContext propagates incoming request id', () => {
    const req = {
      headers: { 'x-request-id': 'req-incoming-1' },
    };
    const res = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    requestContext(req, res, next);

    expect(req.requestId).toBe('req-incoming-1');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-incoming-1');
    expect(next).toHaveBeenCalled();
  });

  it('requestLogger emits structured completion log with latency and actor type', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const req = {
      requestId: 'req-log-1',
      method: 'GET',
      originalUrl: '/api/test',
      headers: {},
      user: { role: 'admin' },
    };
    const res = new EventEmitter();
    res.statusCode = 200;
    const next = jest.fn();

    requestLogger(req, res, next);
    res.emit('finish');

    expect(next).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();

    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload.message).toBe('request.completed');
    expect(payload.requestId).toBe('req-log-1');
    expect(payload.method).toBe('GET');
    expect(payload.route).toBe('/api/test');
    expect(payload.statusCode).toBe(200);
    expect(payload.actorType).toBe('admin');
    expect(typeof payload.latencyMs).toBe('number');
  });

  it('notFound forwards 404 error to global handler', () => {
    const req = { originalUrl: '/missing' };
    const res = {
      status: jest.fn(),
    };
    const next = jest.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toContain('/missing');
  });

  it('errorHandler returns structured payload with requestId and logs correlation context', () => {
    process.env.NODE_ENV = 'test';
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      requestId: 'req-err-1',
      method: 'POST',
      originalUrl: '/api/forecasting/expenses',
      headers: {},
      user: { role: 'user' },
    };
    const res = {
      statusCode: 500,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandler(new Error('Boom'), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Boom',
          statusCode: 500,
          requestId: 'req-err-1',
          stack: expect.any(String),
        }),
      })
    );

    expect(errorSpy).toHaveBeenCalled();
    const logPayload = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(logPayload.message).toBe('request.failed');
    expect(logPayload.requestId).toBe('req-err-1');
    expect(logPayload.actorType).toBe('user');
    expect(logPayload.statusCode).toBe(500);
    expect(logPayload.errorMessage).toBe('Boom');
  });
});

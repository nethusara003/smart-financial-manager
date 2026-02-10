import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '../../test/utils';
import { CurrencySelector } from '../CurrencySelector';

describe('CurrencySelector Component', () => {
  it('renders without crashing', () => {
    renderWithProviders(<CurrencySelector />);
    // Basic smoke test - component should render
    expect(document.body).toBeTruthy();
  });
});

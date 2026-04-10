const sanitize = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
};

const write = (level, message, context = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const formatted = JSON.stringify(payload, (_key, value) => sanitize(value));

  if (level === "error") {
    console.error(formatted);
    return;
  }

  console.log(formatted);
};

export const logInfo = (message, context = {}) => {
  write("info", message, context);
};

export const logWarn = (message, context = {}) => {
  write("warn", message, context);
};

export const logError = (message, context = {}) => {
  write("error", message, context);
};

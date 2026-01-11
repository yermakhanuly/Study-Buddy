export function createError(status, message, code = "ERROR") {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

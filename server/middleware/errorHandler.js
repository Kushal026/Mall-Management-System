export function errorHandler(err, req, res, next) {
  console.error('API error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    errors: err.details || undefined,
  });
}

export function validationError(message, details) {
  const error = new Error(message);
  error.status = 400;
  error.details = details;
  return error;
}

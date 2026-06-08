// Centralized error handler. Keeps route handlers free of try/catch boilerplate
// once business logic is added — handlers can just call next(err).

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = { notFoundHandler, errorHandler };

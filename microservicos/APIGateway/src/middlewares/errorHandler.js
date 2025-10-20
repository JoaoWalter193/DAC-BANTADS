function errorHandler(err, req, res, next) {
  console.error(`[Erro no Gateway] ${err.message}`);
  res.status(err.status || 500).json({
    error: 'Erro no Gateway',
    message: err.message || 'Erro interno do servidor'
  });
}

module.exports = errorHandler;

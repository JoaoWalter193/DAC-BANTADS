function errorHandler(err, req, res, next) {
  console.error("Erro no API Gateway:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ mensagem: "Erro interno no API Gateway" });
}

module.exports = errorHandler;

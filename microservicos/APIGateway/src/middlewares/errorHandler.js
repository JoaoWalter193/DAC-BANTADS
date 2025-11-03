function errorHandler(err, req, res, next) {
  console.error("Erro no API Gateway:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ cod: 500, mensagem: "Erro interno no API Gateway" });
}

module.exports = errorHandler;

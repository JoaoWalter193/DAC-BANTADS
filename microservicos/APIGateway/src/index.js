require("dotenv-safe").config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 1) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas requisições, tente novamente mais tarde."
});
app.use(limiter);

function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ auth: false, message: 'Nenhum token fornecido' });
  jwt.verify(token, process.env.GATEWAY_JWT_SECRET || 'segredo', (err, decoded) => {
    if (err) return res.status(401).json({ auth: false, message: 'Falha ao autenticar' });
    req.userId = decoded.id;
    next();
  });
}

// Proxies
app.use('/users', verifyJWT, createProxyMiddleware({
  target: process.env.USERS_SERVICE_URL || 'http://localhost:4000',
  changeOrigin: true,
  pathRewrite: { '^/users': '' },
}));

app.use('/orders', verifyJWT, createProxyMiddleware({
  target: process.env.ORDERS_SERVICE_URL || 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: { '^/orders': '' },
}));

app.use('/products', createProxyMiddleware({
  target: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:6000',
  changeOrigin: true,
  pathRewrite: { '^/products': '' },
}));

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado no Gateway', details: err.message });
});

// Rota fallback
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway rodando na porta ${PORT}`));

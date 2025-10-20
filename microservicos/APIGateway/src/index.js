const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const setupProxies = require('./routes/proxies');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const config = require('./config/services');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestLogger);

app.use(rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: "Muitas requisições, tente novamente mais tarde."
}));

setupProxies(app);

app.use(errorHandler);
app.use('*', (req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.listen(config.PORT, () => console.log(`API Gateway rodando na porta ${config.PORT}`));

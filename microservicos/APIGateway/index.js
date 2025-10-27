const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const setupProxies = require('./src/routes/proxies');
const errorHandler = require('./src/middlewares/errorHandler');
const requestLogger = require('./src/middlewares/requestLogger');
const config = require('./src/config/service');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestLogger);

setupProxies(app);

app.use(errorHandler);
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.listen(config.PORT, () => console.log(`API Gateway rodando na porta ${config.PORT}`));

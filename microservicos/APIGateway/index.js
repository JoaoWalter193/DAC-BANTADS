require("dotenv-safe").config();

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
var http = require('http');
const rateLimit = require('express-rate-limit');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.unsubscribe(cors());
app.use(logger('dev'));

app.use ( bodyParser.urlencoded( { extended: false}));
app.use (bodyParser.json());


app.use(express.json());
app.use(express.urlencoded(	{	extended: false}))
app.use(cookieParser());
var server = http.createServer(app);
server.listen(3000);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas requisições feitas a partir deste IP, por favor, tente novamente mais tarde"
});

function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ auth: false, message: 'Nenhum token fornecido' });
  }

  jwt.verify(token, process.env.GATEWAY_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ auth: false, message: 'Falha ao autenticar' });
    }
    req.userId = decoded.id;
    next();
  });
}

app.use(limiter);

require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const setupProxies = require("./src/routes/proxies");
const errorHandler = require("./src/middlewares/errorHandler");
const requestLogger = require("./src/middlewares/requestLogger");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: "http://localhost",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestLogger);

setupProxies(app);

app.use(errorHandler);

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway rodando na porta ${PORT}`));

require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
var http = require('http');
const express = require('express');
const httpProxy = require('express-http-proxy');
const app = express()
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const helmet = require('helmet');

app.use ( bodyParser.urlencoded( { extended: false}));
app.use (bodyParser.json());


app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded(	{	extended: false}))
app.use(cookieParser());
var server = http.createServer(app);
server.listen(3000);

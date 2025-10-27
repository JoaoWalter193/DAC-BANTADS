const jwt = require('jsonwebtoken');
const config = require('../config/service');

function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

module.exports = verifyJWT;

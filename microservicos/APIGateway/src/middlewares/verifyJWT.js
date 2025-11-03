const jwt = require('jsonwebtoken');
const config = require('../config/service');

function verifyJWT(req, res, next) {
  const enabled = String(process.env.ENABLE_AUTH || 'false').toLowerCase() === 'true';
  if (!enabled) return next();

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({mensagem: 'O usuário não está logado'});
  }

  const token = authHeader.split(' ') [1];
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET não está definido nas variáveis de ambiente');
      return res.status(500).json({mensagem: 'Erro no servidor'});
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erro ao verificar o token JWT:', err);
    return res.status(401).json({mensagem: 'Token inválido ou expirado'});
  }
}

function requireRoles(roles = []) {
  return (req, res, next) => {
    const enabled = String(process.env.ENABLE_AUTH || 'false').toLowerCase() === 'true';
    if (!enabled) return next();

    const user = req.user;
    const userRole = (user && (user.role || user.tipo || user.tipoUsuario)) || null;

    if (!userRole) {
      return res.status(401).json({mensagem: 'O usuário não está logado'});
    }

    if (!roles || roles.length === 0 || roles.includes(userRole)) return next();

    return res.status(403).json({mensagem: 'O usuário não tem permissão para efetuar esta operação'});
  };
}

module.exports = { verifyJWT, requireRoles };

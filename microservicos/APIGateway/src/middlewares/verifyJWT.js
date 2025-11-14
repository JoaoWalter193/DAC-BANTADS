const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, "keys/public-key.pem"),
  "utf8"
);

function verifyJWT(req, res, next) {
  const enabled =
    String(process.env.ENABLE_AUTH || "false").toLowerCase() === "true";
  if (!enabled) return next();

  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "O usuário não está logado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: "mybackend",
    });

    // normaliza o papel
    const scope = decoded.scope || "";
    const role = scope.replace("ROLE_", "");

    req.user = {
      sub: decoded.sub || null,
      email: decoded.usuario?.email || null,
      role,
      raw: decoded,
    };

    next();
  } catch (err) {
    console.error("Erro ao verificar o token JWT:", err);
    return res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
}

function requireRoles(roles = []) {
  return (req, res, next) => {
    const enabled =
      String(process.env.ENABLE_AUTH || "false").toLowerCase() === "true";
    if (!enabled) return next();

    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ mensagem: "O usuário não está logado" });
    }

    if (roles.length === 0 || roles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      mensagem: "O usuário não tem permissão para efetuar esta operação",
    });
  };
}

module.exports = { verifyJWT, requireRoles };

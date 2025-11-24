// verifyJWT.js - versão com token blacklist
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, "keys/public-key.pem"),
  "utf8"
);

// ✅ DEFINIR O MAPA AQUI (fora das funções)
const emailStorage = new Map();

// ✅ NOVO: Token blacklist para logout
const tokenBlacklist = new Set();

function verifyJWT(req, res, next) {
  const enabled =
    String(process.env.ENABLE_AUTH || "false").toLowerCase() === "true";
  if (!enabled) {
    console.log("🔐 Autenticação desabilitada");
    return next();
  }

  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  console.log(
    "🔍 VerifyJWT - Header Authorization:",
    authHeader ? "Presente" : "Ausente"
  );

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ VerifyJWT - Header Authorization inválido ou ausente");
    return res.status(401).json({ mensagem: "O usuário não está logado" });
  }

  const token = authHeader.split(" ")[1];
  console.log(
    "🔍 VerifyJWT - Token recebido:",
    token ? `Presente (${token.length} chars)` : "Ausente"
  );

  if (!token) {
    console.log("❌ VerifyJWT - Token vazio");
    return res.status(401).json({ mensagem: "O usuário não está logado" });
  }

  // ✅ NOVA VERIFICAÇÃO: Check token blacklist
  if (tokenBlacklist.has(token)) {
    console.log("❌ VerifyJWT - Token invalidado via logout");
    return res.status(401).json({ mensagem: "Token inválido - logout realizado" });
  }

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: "mybackend",
    });

    console.log("🔍 VerifyJWT - Token decodificado:", {
      sub: decoded.sub,
      email: decoded.email,
      scope: decoded.scope,
      exp: decoded.exp,
    });

    // Extrair role
    let role = "";
    if (decoded.scope) {
      role = decoded.scope.replace("ROLE_", "");
    }

    console.log("🔍 VerifyJWT - Role extraído:", role);

    let email = "";

    // ✅ AGORA emailStorage ESTÁ DEFINIDO
    // Tenta buscar do storage por CPF (se existir CPF no token)
    if (decoded.cpf && emailStorage.has(decoded.cpf)) {
      email = emailStorage.get(decoded.cpf);
      console.log("✅ Email recuperado do storage:", email);
    }
    // Se não encontrou CPF, tenta por ID (sub)
    else if (decoded.sub && emailStorage.has(decoded.sub)) {
      email = emailStorage.get(decoded.sub);
      console.log("✅ Email recuperado do storage por ID:", email);
    }
    // Se não encontrou, usa string vazia
    else {
      email = "";
      console.log("🔍 Email não encontrado no storage, usando string vazia");
    }

    req.user = {
      sub: decoded.sub || null,
      email: email,
      role: role,
      raw: decoded,
    };

    console.log(
      "✅ VerifyJWT - Token válido. Email:",
      req.user.email ? req.user.email : "(vazio)",
      "Role:",
      req.user.role
    );
    next();
  } catch (err) {
    console.error("❌ VerifyJWT - Erro ao verificar token:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ mensagem: "Token expirado" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ mensagem: "Token inválido" });
    }

    return res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
}

// ✅ NOVA FUNÇÃO: Adicionar token à blacklist
function invalidateToken(token) {
  if (token) {
    tokenBlacklist.add(token);
    console.log("✅ Token adicionado à blacklist:", token.substring(0, 10) + "...");

    // Opcional: Limpar token após expiração
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp * 1000 - Date.now();
        if (expiresIn > 0) {
          setTimeout(() => {
            tokenBlacklist.delete(token);
            console.log("🕒 Token removido da blacklist (expirou)");
          }, expiresIn);
        }
      }
    } catch (e) {
      console.log("⚠️ Não foi possível decodificar token para limpeza automática");
    }
  }
}

// ✅ NOVA FUNÇÃO: Obter token do request
function getTokenFromRequest(req) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
}

function salvarEmailParaLogout(cpf, email) {
  if (cpf && email) {
    emailStorage.set(cpf, email);
    console.log("✅ Email salvo para logout - CPF:", cpf, "Email:", email);
  }
}

// ✅ FUNÇÃO PARA SALVAR POR ID TAMBÉM (caso não tenha CPF)
function salvarEmailParaLogoutPorId(id, email) {
  if (id && email) {
    emailStorage.set(id, email);
    console.log("✅ Email salvo para logout - ID:", id, "Email:", email);
  }
}

function removerEmailDoStorage(cpf) {
  if (cpf && emailStorage.has(cpf)) {
    const emailRemovido = emailStorage.get(cpf);
    emailStorage.delete(cpf);
    console.log(
      "✅ Email removido do storage - CPF:",
      cpf,
      "Email:",
      emailRemovido
    );
    return emailRemovido;
  }
  return "";
}

// ✅ FUNÇÃO PARA REMOVER POR ID TAMBÉM
function removerEmailDoStoragePorId(id) {
  if (id && emailStorage.has(id)) {
    const emailRemovido = emailStorage.get(id);
    emailStorage.delete(id);
    console.log(
      "✅ Email removido do storage - ID:",
      id,
      "Email:",
      emailRemovido
    );
    return emailRemovido;
  }
  return "";
}

function requireRoles(roles = []) {
  return (req, res, next) => {
    const enabled =
      String(process.env.ENABLE_AUTH || "false").toLowerCase() === "true";
    if (!enabled) {
      console.log("🔐 Verificação de roles desabilitada");
      return next();
    }

    const user = req.user;
    console.log("🔍 requireRoles - User:", user);
    console.log("🔍 requireRoles - Roles exigidos:", roles);

    if (!user || !user.role) {
      console.log("❌ requireRoles - Usuário não autenticado ou sem role");
      return res.status(401).json({ mensagem: "O usuário não está logado" });
    }

    if (roles.length === 0 || roles.includes(user.role)) {
      console.log("✅ requireRoles - Acesso permitido para role:", user.role);
      return next();
    }

    console.log(
      "❌ requireRoles - Acesso negado. Role:",
      user.role,
      "não está em",
      roles
    );
    return res.status(403).json({
      mensagem: "O usuário não tem permissão para efetuar esta operação",
    });
  };
}

module.exports = {
  verifyJWT,
  requireRoles,
  salvarEmailParaLogout,
  salvarEmailParaLogoutPorId,
  removerEmailDoStorage,
  removerEmailDoStoragePorId,
  invalidateToken,           // ✅ EXPORTAR NOVAS FUNÇÕES
  getTokenFromRequest,       // ✅ EXPORTAR NOVAS FUNÇÕES
};
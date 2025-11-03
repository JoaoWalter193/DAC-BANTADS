const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyJWT, requireRoles } = require("../middlewares/verifyJWT");

function setupProxies(app) {
  const AUTH = process.env.AUTH_SERVICE_URL;
  const CLIENTE = process.env.CLIENTE_SERVICE_URL;
  const CONTA = process.env.CONTA_SERVICE_URL;
  const GERENTE = process.env.GERENTE_SERVICE_URL;

  console.log("🔍 Variáveis de ambiente carregadas:");
  console.log({ AUTH, CLIENTE, CONTA, GERENTE });

  const proxyOptions = (target, rewritePrefix) => ({
    target,
    changeOrigin: true,
    proxyTimeout: 30_000,
    timeout: 30_000,
  });

  app.post("/login", createProxyMiddleware(proxyOptions(AUTH)));

  app.post(
    "/logout",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(AUTH))
  );

  app.get(
    "/clientes",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  app.post(
    "/clientes",
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  app.put(
    "/clientes/:cpf",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  app.post(
    "/clientes/:cpf/aprovar",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  app.post(
    "/clientes/:cpf/rejeitar",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  const contaActions = ["saldo", "depositar", "sacar", "transferir", "extrato"];
  contaActions.forEach((act) => {
    app.post(
      `/contas/:numero/${act}`,
      //verifyJWT,
      createProxyMiddleware(proxyOptions(CONTA))
    );
  });

  app.get(
    "/gerentes",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.post(
    "/gerentes",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.get(
    "/gerentes/:cpf",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.delete(
    "/gerentes/:cpf",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.put(
    "/gerentes/:cpf",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  console.log("✅ Proxies configurados.");
}

module.exports = setupProxies;

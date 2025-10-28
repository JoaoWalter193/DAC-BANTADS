const { createProxyMiddleware } = require("http-proxy-middleware");
const verifyJWT = require("../middlewares/verifyJWT");

function setupProxies(app) {
  const AUTH_SERVICE = process.env.AUTH_SERVICE_URL;
  const CLIENTE_SERVICE = process.env.CLIENTE_SERVICE_URL;
  const CONTA_SERVICE = process.env.CONTA_SERVICE_URL;
  const GERENTE_SERVICE = process.env.GERENTE_SERVICE_URL;

  console.log("🔍 Variáveis de ambiente carregadas:");
  console.log({
    AUTH_SERVICE,
    CLIENTE_SERVICE,
    CONTA_SERVICE,
    GERENTE_SERVICE,
  });

  app.get("/reboot", (req, res) => {
    res.status(200).send("Banco de dados criado conforme especificação");
  });

  app.post(
    "/login",
    createProxyMiddleware({
      target: AUTH_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/login": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/logout",
    verifyJWT,
    createProxyMiddleware({
      target: AUTH_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/logout": "/" },
      logLevel: "debug",
    })
  );

  app.get(
    "/clientes",
    verifyJWT,
    createProxyMiddleware({
      target: CLIENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/clientes": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/clientes",
    createProxyMiddleware({
      target: CLIENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/clientes": "/" },
      logLevel: "debug",
    })
  );

  app.get(
    "/clientes/:cpf",
    verifyJWT,
    createProxyMiddleware({
      target: CLIENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/clientes": "/" },
      logLevel: "debug",
    })
  );

  app.put(
    "/clientes/:cpf",
    verifyJWT,
    createProxyMiddleware({
      target: CLIENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/clientes": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/clientes/:cpf/aprovar",
    verifyJWT,
    createProxyMiddleware({
      target: CLIENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/clientes": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/clientes/:cpf/rejeitar",
    verifyJWT,
    createProxyMiddleware({
      target: CLIENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/clientes": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/contas/:numero/saldo",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/contas": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/contas/:numero/depositar",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/contas": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/contas/:numero/sacar",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/contas": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/contas/:numero/transferir",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/contas": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/contas/:numero/extrato",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/contas": "/" },
      logLevel: "debug",
    })
  );

  app.get(
    "/gerentes",
    verifyJWT,
    createProxyMiddleware({
      target: GERENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/gerentes": "/" },
      logLevel: "debug",
    })
  );

  app.post(
    "/gerentes",
    verifyJWT,
    createProxyMiddleware({
      target: GERENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/gerentes": "/" },
      logLevel: "debug",
    })
  );

  app.get(
    "/gerentes/:cpf",
    verifyJWT,
    createProxyMiddleware({
      target: GERENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/gerentes": "/" },
      logLevel: "debug",
    })
  );

  app.delete(
    "/gerentes/:cpf",
    verifyJWT,
    createProxyMiddleware({
      target: GERENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/gerentes": "/" },
      logLevel: "debug",
    })
  );

  app.put(
    "/gerentes/:cpf",
    verifyJWT,
    createProxyMiddleware({
      target: GERENTE_SERVICE,
      changeOrigin: true,
      pathRewrite: { "^/gerentes": "/" },
      logLevel: "debug",
    })
  );
}

module.exports = setupProxies;

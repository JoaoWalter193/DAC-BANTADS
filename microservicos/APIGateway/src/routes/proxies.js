const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyJWT, requireRoles } = require("../middlewares/verifyJWT");

function setupProxies(app) {
  const SAGA = process.env.SAGA_SERVICE_URL;
  const AUTH = process.env.AUTH_SERVICE_URL;
  const CLIENTE = process.env.CLIENTE_SERVICE_URL;
  const CONTA = process.env.CONTA_SERVICE_URL;
  const GERENTE = process.env.GERENTE_SERVICE_URL;

  console.log("🔍 Variáveis de ambiente carregadas:");
  console.log({ AUTH, CLIENTE, CONTA, GERENTE });

  const proxyOptions = (target) => ({
    target,
    changeOrigin: true,
    proxyTimeout: 30_000,
    timeout: 30_000,
    onProxyReq(proxyReq, req, res) {
      if (proxyReq.method === "GET") {
        proxyReq.removeHeader("Content-Type");
        proxyReq.removeHeader("Content-Length");
        return;
      }

      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  });

  app.get("/reboot", async (req, res) => {
    res.status(200).json({
      mensagem: "Banco de dados criado conforme especificação",
    });
  });

  app.post("/login", createProxyMiddleware(proxyOptions(AUTH)));

  app.post(
    "/logout",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(AUTH))
  );

  app.get("/clientes", require("./compositions/clienteComposition"));

  app.post("/clientes", createProxyMiddleware(proxyOptions(SAGA)));

  app.put(
    "/clientes/:cpf",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  app.post(
    "/clientes/:cpf/aprovar",
    //verifyJWT,
    createProxyMiddleware(proxyOptions(SAGA))
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
      createProxyMiddleware({
        target: CONTA,
        changeOrigin: true,
        proxyTimeout: 30000,
        timeout: 30000,

        onProxyReq: (proxyReq, req, res) => {
          if (act === "saldo" || act === "extrato") {
            proxyReq.method = "GET";
          }

          if (act === "depositar" || act === "sacar" || act === "transferir") {
            proxyReq.method = "PUT";
          }
        },
      })
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

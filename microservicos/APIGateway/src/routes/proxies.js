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

  app.put(
    "/clientes/:cpf",
    //verifyJWT,
    createProxyMiddleware({
      target: CLIENTE,
      changeOrigin: true,

      onProxyReq(proxyReq, req, res) {
        if (req.method === "PUT" && req.body) {
          let newBody = { ...req.body };

          if (newBody.CEP !== undefined) {
            newBody.cep = newBody.CEP;
            delete newBody.CEP;
          }

          const bodyData = JSON.stringify(newBody);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
    })
  );

  app.get("/clientes", require("./compositions/clienteComposition"));

  app.post("/clientes", createProxyMiddleware(proxyOptions(SAGA)));

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

        pathRewrite: (path, req) => {
          return `/contas/${req.params.numero}/${act}`;
        },

        onProxyReq(proxyReq, req) {
          if (act === "saldo" || act === "extrato") {
            proxyReq.method = "GET";
            proxyReq.removeHeader("Content-Type");
            proxyReq.removeHeader("Content-Length");
            return;
          }

          proxyReq.method = "PUT";

          if (req.body) {
            let newBody = { ...req.body };

            if (act === "transferir" && newBody.destino) {
              newBody = {
                valor: newBody.valor,
                numeroConta: newBody.destino,
              };
            }

            if (act === "depositar" || act === "sacar") {
              if (typeof newBody.valor !== "number") {
                console.error("Valor inválido recebido:", newBody);
              }

              const raw = String(newBody.valor);
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader("Content-Length", Buffer.byteLength(raw));
              proxyReq.write(raw);
              return;
            }

            const bodyData = JSON.stringify(newBody);
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
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

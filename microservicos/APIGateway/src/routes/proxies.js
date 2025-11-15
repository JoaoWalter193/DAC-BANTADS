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
    proxyTimeout: 30000,
    timeout: 30000,
    onProxyReq(proxyReq, req) {
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

  app.get("/reboot", (req, res) => {
    res.status(200).json({
      mensagem: "Banco de dados criado conforme especificação",
    });
  });

  app.post("/login", createProxyMiddleware(proxyOptions(AUTH)));

  app.post("/logout", verifyJWT, (req, res) => {
    const user = req.user;

    return res.status(200).json({
      id: user.sub,
      email: user.email,
      role: user.role,
      mensagem: "Logout efetuado com sucesso",
    });
  });

  app.put(
    "/clientes/:cpf",
    verifyJWT,
    createProxyMiddleware({
      target: CLIENTE,
      changeOrigin: true,

      onProxyReq(proxyReq, req) {
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

  app.get(
    "/clientes",
    verifyJWT,
    (req, res, next) => {
      const filtro = req.query.filtro;

      if (!filtro) {
        return requireRoles(["GERENTE"])(req, res, next);
      }

      if (filtro === "para_aprovar") {
        return requireRoles(["GERENTE"])(req, res, next);
      }

      if (filtro === "adm_relatorio_clientes") {
        return requireRoles(["ADMINISTRADOR"])(req, res, next);
      }

      if (filtro === "melhores_clientes") {
        return requireRoles(["GERENTE"])(req, res, next);
      }

      return res.status(400).json({
        mensagem: "Filtro inválido",
      });
    },
    require("./compositions/clienteComposition")
  );

  app.post("/clientes", createProxyMiddleware(proxyOptions(SAGA)));

  app.post(
    "/clientes/:cpf/aprovar",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(SAGA))
  );

  app.post(
    "/clientes/:cpf/rejeitar",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(CLIENTE))
  );

  const contaActions = ["saldo", "depositar", "sacar", "transferir", "extrato"];

  contaActions.forEach((act) => {
    app.post(
      `/contas/:numero/${act}`,
      verifyJWT,
      createProxyMiddleware({
        target: CONTA,
        changeOrigin: true,

        pathRewrite: (_, req) => {
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
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    require("./compositions/gerenteComposition")
  );

  app.post(
    "/gerentes",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.get(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.delete(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  app.put(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(GERENTE))
  );

  console.log("✅ Proxies configurados.");
}

module.exports = setupProxies;

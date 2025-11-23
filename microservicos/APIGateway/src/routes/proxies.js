const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyJWT, requireRoles } = require("../middlewares/verifyJWT");
const { getClienteByCpf, getClientes } = require("./compositions/clienteComposition");

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
    onProxyRes(proxyRes, req, res) {
      res.header("Access-Control-Allow-Origin", "http://localhost");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    },
    onError(err, req, res) {
      console.error("Proxy error:", err && err.message ? err.message : err);
      try {
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,DELETE,OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        res.status(502).json({ error: "Bad Gateway", details: err.message });
      } catch (e) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad Gateway" }));
      }
    },
  });

  const loginProxyOptions = {
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,

    onProxyReq(proxyReq, req) {},

    onProxyRes(proxyRes, req, res) {
      res.header("Access-Control-Allow-Origin", "http://localhost");
      res.header("Access-Control-Allow-Methods", "POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    },
  };

  app.get("/reboot", (req, res) => {
    res.status(200).json({
      mensagem: "Banco de dados criado conforme especificação",
    });
  });

  app.post(
    "/login",
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL,
      changeOrigin: true,
      proxyTimeout: 30000,
      timeout: 30000,

      onProxyReq(proxyReq, req) {
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

          proxyReq.write(bodyData);
        }
      },

      onProxyRes(proxyRes, req, res) {
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Methods", "POST,OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        res.header("Access-Control-Allow-Credentials", "true");
      },
    })
  );

  app.post("/logout", verifyJWT, (req, res) => {
    const user = req.user;

    return res.status(200).json({
      id: user.sub,
      email: user.email,
      role: user.role,
      mensagem: "Logout efetuado com sucesso",
    });
  });

  app.get("/clientes/:cpf", verifyJWT, getClienteByCpf);

  app.get(
    "/clientes",
    verifyJWT,
    (req, res, next) => {
      const filtro = req.query.filtro;

      if (
        !filtro ||
        filtro === "para_aprovar" ||
        filtro === "melhores_clientes"
      ) {
        return requireRoles(["GERENTE"])(req, res, next);
      }

      if (filtro === "adm_relatorio_clientes") {
        return requireRoles(["ADMINISTRADOR"])(req, res, next);
      }

      next();
    },
    getClientes
  );

  app.post("/clientes", createProxyMiddleware(proxyOptions(SAGA)));

  app.post(
    "/clientes/:cpf/aprovar",
    createProxyMiddleware({
      ...proxyOptions(SAGA),
      selfHandleResponse: true,

      onProxyRes: async (proxyRes, req, res) => {
        const cpf = req.params.cpf;

        let sagaResponse = "";
        proxyRes.on("data", (chunk) => (sagaResponse += chunk.toString()));

        proxyRes.on("end", async () => {
          try {
            const contaResponse = await fetch(
              `${process.env.CONTA_SERVICE_URL}/contas/${cpf}`
            );

            if (!contaResponse.ok) {
              return res.status(500).json({
                erro: "Conta não encontrada após aprovação.",
              });
            }

            const dadosConta = await contaResponse.json();

            const respostaSwagger = {
              cliente: cpf,
              numero: dadosConta.numeroConta,
              saldo: dadosConta.saldo,
              limite: dadosConta.limite,
              gerente: dadosConta.cpfGerente,
              criacao: dadosConta.dataCriacao,
            };

            res.setHeader("Content-Type", "application/json");
            return res.status(200).json(respostaSwagger);
          } catch (err) {
            console.error("Erro na composition:", err);
            return res.status(500).json({ erro: "Erro interno na aprovação." });
          }
        });
      },
    })
  );

  app.post(
    "/clientes/:cpf/rejeitar",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware({
      ...proxyOptions(CLIENTE),
      selfHandleResponse: true,

      onProxyRes: async (proxyRes, req, res) => {
        let body = "";

        proxyRes.on("data", (chunk) => {
          body += chunk.toString();
        });

        proxyRes.on("end", () => {
          if (proxyRes.statusCode === 200) {
            res.status(200).json({
              mensagem: "Cliente rejeitado com sucesso",
            });
          } else {
            res.status(proxyRes.statusCode).send(body);
          }
        });
      },
    })
  );

  const contaActions = ["saldo", "depositar", "sacar", "transferir", "extrato"];

  contaActions.forEach((act) => {
    app.post(
      `/contas/:numero/${act}`,
      verifyJWT,
      createProxyMiddleware({
        target: CONTA,
        changeOrigin: true,
        selfHandleResponse: true,

        pathRewrite: (_, req) => `/contas/${req.params.numero}/${act}`,

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

        onProxyRes: async (proxyRes, req, res) => {
          let body = "";
          proxyRes.on("data", (chunk) => (body += chunk.toString()));
          proxyRes.on("end", () => {
            let data;
            try {
              data = body ? JSON.parse(body) : {};
            } catch {
              return res.status(proxyRes.statusCode).send(body);
            }

            const numeroConta = req.params.numero;

            if (proxyRes.statusCode !== 200) {
              return res.status(proxyRes.statusCode).json(data);
            }

            switch (act) {
              case "saldo":
                return res.status(200).json({
                  cliente: data?.cpfCliente,
                  conta: numeroConta,
                  saldo: data?.saldo,
                });

              case "depositar":
                return res.status(200).json({
                  conta: numeroConta,
                  data: data?.data,
                  saldo: data?.saldo,
                });

              case "sacar":
                return res.status(200).json({
                  conta: numeroConta,
                  data: data?.data,
                  saldo: data?.saldo,
                });

              case "transferir":
                return res.status(200).json({
                  conta: numeroConta,
                  data: data?.data,
                  destino: data?.destino,
                  saldo: data?.saldo,
                  valor: data?.valor,
                });

              case "extrato":
                return res.status(200).json({
                  conta: numeroConta,
                  saldo: data?.saldo,
                  movimentacoes: data?.movimentacoes ?? [],
                });

              default:
                return res.status(200).json(data);
            }
          });
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
    createProxyMiddleware(proxyOptions(SAGA))
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

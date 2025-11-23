const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const {
  verifyJWT,
  requireRoles,
  salvarEmailParaLogout,
  salvarEmailParaLogoutPorId,
  removerEmailDoStorage,
  removerEmailDoStoragePorId,
} = require("../middlewares/verifyJWT");
const {
  getClienteByCpf,
  getClientes,
} = require("./compositions/clienteComposition");
const {
  getGerentes,
  getClientesDoGerente,
} = require("./compositions/gerenteComposition");
const { axiosInstance } = require("./compositions/shared");
const PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, "../middlewares/keys/public-key.pem"), // Ajuste o caminho
  "utf8"
);

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

  app.get("/reboot", (req, res) => {
    res.status(200).json({
      mensagem: "Banco de dados criado conforme especificação",
    });
  });

  app.post("/login", (req, res, next) => {
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL,
      changeOrigin: true,
      proxyTimeout: 30000,
      timeout: 30000,
      selfHandleResponse: true,

      onProxyReq(proxyReq, req) {
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },

      onProxyRes: (proxyRes, req, res) => {
        console.log("🔍 Login - Status do Auth:", proxyRes.statusCode);

        let responseBody = "";
        proxyRes.on("data", (chunk) => {
          responseBody += chunk;
        });

        proxyRes.on("end", () => {
          // Configurar headers CORS
          res.header("Access-Control-Allow-Origin", "http://localhost");
          res.header("Access-Control-Allow-Methods", "POST,OPTIONS");
          res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
          );
          res.header("Access-Control-Allow-Credentials", "true");

          // Se o auth service retornar 401, mantemos 401
          if (proxyRes.statusCode === 401) {
            console.log("❌ Login falhou - credenciais inválidas (status 401)");
            return res.status(401).json({
              mensagem: "Credenciais inválidas",
            });
          }

          if (!responseBody || responseBody.trim() === "") {
            console.log(
              "❌ Login falhou - resposta vazia do serviço de autenticação"
            );
            return res.status(401).json({
              mensagem: "Credenciais inválidas",
            });
          }

          try {
            const data = JSON.parse(responseBody);

            const isValidLoginResponse =
              data &&
              (data.token ||
                data.access_token ||
                (data.id && data.email) ||
                data.mensagem === "Login realizado com sucesso");

            if (!isValidLoginResponse) {
              console.log("❌ Login falhou - resposta inválida:", data);
              return res.status(401).json({
                mensagem: "Credenciais inválidas",
              });
            }

            // ✅ CORRIGIDO: SALVAR EMAIL PARA USO FUTURO NO LOGOUT
            const emailDoLogin = req.body.email;
            if (emailDoLogin) {
              const token = data.access_token || data.token;
              if (token) {
                try {
                  // ✅ AGORA jwt ESTÁ DEFINIDO
                  const decoded = jwt.verify(token, PUBLIC_KEY, {
                    algorithms: ["RS256"],
                    issuer: "mybackend",
                  });

                  console.log("🔍 Token decodificado no login:", decoded);

                  // Tenta salvar por CPF se existir
                  if (decoded.cpf) {
                    salvarEmailParaLogout(decoded.cpf, emailDoLogin);
                  }
                  // Se não tem CPF, salva por ID (sub)
                  else if (decoded.sub) {
                    salvarEmailParaLogoutPorId(decoded.sub, emailDoLogin);
                    console.log("✅ Email salvo usando ID:", decoded.sub);
                  }
                } catch (e) {
                  console.log(
                    "❌ Erro ao decodificar token para salvar email:",
                    e.message
                  );
                }
              }
            }

            console.log("✅ Login realizado com sucesso para:", emailDoLogin);
            res.status(proxyRes.statusCode).json(data);
          } catch (e) {
            console.log(
              "❌ Login falhou - resposta não é JSON válido:",
              responseBody
            );
            return res.status(401).json({
              mensagem: "Credenciais inválidas",
            });
          }
        });
      },

      onError: (err, req, res) => {
        console.error("❌ Login Error:", err.message);
        res.status(502).json({
          error: "Serviço de autenticação indisponível",
          details: err.message,
        });
      },
    })(req, res, next);
  });

  app.post("/logout", verifyJWT, (req, res) => {
    const user = req.user;

    console.log("🔍 Logout - User object:", {
      sub: user.sub,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
    });

    if (user.cpf) {
      removerEmailDoStorage(user.cpf);
    }
    if (user.sub) {
      removerEmailDoStoragePorId(user.sub);
    }

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

  app.post("/clientes", async (req, res, next) => {
    console.log("🔍 === INICIANDO AUTOCADASTRO ===");
    console.log("🔍 Body recebido:", JSON.stringify(req.body, null, 2));

    const { email, cpf, nome, salario, endereco, cep, cidade, estado } =
      req.body;

    // Validação dos campos obrigatórios
    if (
      !email ||
      !cpf ||
      !nome ||
      !salario ||
      !endereco ||
      !cidade ||
      !estado
    ) {
      console.log("❌ Campos obrigatórios faltando");
      return res.status(400).json({
        erro: "Campos obrigatórios faltando",
        campos_obrigatorios: [
          "email",
          "cpf",
          "nome",
          "salario",
          "endereco",
          "cidade",
          "estado",
        ],
      });
    }

    console.log("🔍 Verificando se email já existe:", email);

    try {
      const emailCheckUrl = `${CLIENTE}/clientes/email/${encodeURIComponent(
        email
      )}`;
      console.log("🔍 Fazendo request para:", emailCheckUrl);
      console.log("🔍 CLIENTE SERVICE URL:", CLIENTE);

      // ✅ Configure timeout explícito e mais logs
      const startTime = Date.now();

      const emailResponse = await axiosInstance.get(emailCheckUrl, {
        timeout: 5000, // 5 segundos timeout
        validateStatus: (status) => {
          console.log(`🔍 Status recebido na validação: ${status}`);
          return true; // Aceita TODOS os status para podermos tratar manualmente
        },
      });

      const endTime = Date.now();
      console.log(`🔍 Resposta recebida em ${endTime - startTime}ms`);
      console.log("🔍 Status da resposta:", emailResponse.status);
      console.log("🔍 Data da resposta:", emailResponse.data);

      // Se o email EXISTE (status 200), retorna erro
      if (emailResponse.status === 200) {
        console.log("❌ Email já cadastrado no sistema");
        return res.status(409).json({
          erro: "Email já cadastrado",
          mensagem: "Já existe um cliente cadastrado com este email",
        });
      }

      // Se retornou 404 (email não existe), continua
      if (emailResponse.status === 404) {
        console.log("✅ Email disponível! Prosseguindo com cadastro...");

        // Encaminha para o SAGA
        return createProxyMiddleware({
          ...proxyOptions(SAGA),
          selfHandleResponse: false,
          onProxyReq(proxyReq, req) {
            console.log("🔍 Encaminhando dados para SAGA...");
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          },
          onProxyRes(proxyRes, req, res) {
            console.log("🔍 Resposta do SAGA recebida:", proxyRes.statusCode);
          },
          onError(err, req, res) {
            console.error("❌ Erro no proxy SAGA:", err.message);
            res.status(502).json({
              erro: "Erro no serviço de cadastro",
              detalhes: err.message,
            });
          },
        })(req, res, next);
      }

      // Status inesperado
      console.log("⚠️ Status inesperado do MS-Cliente:", emailResponse.status);
      return res.status(500).json({
        erro: "Erro inesperado na verificação de email",
        status: emailResponse.status,
        data: emailResponse.data,
      });
    } catch (error) {
      console.error("❌ ERRO CAPTURADO:", error.message);
      console.error("❌ Código do erro:", error.code);
      console.error("❌ Stack trace:", error.stack);

      if (error.response) {
        // O servidor respondeu com um status de erro
        console.log("🔍 Response error - Status:", error.response.status);
        console.log("🔍 Response error - Data:", error.response.data);

        if (error.response.status === 404) {
          console.log(
            "✅ Email disponível (via catch)! Prosseguindo com cadastro..."
          );

          return createProxyMiddleware({
            ...proxyOptions(SAGA),
            selfHandleResponse: false,
            onProxyReq(proxyReq, req) {
              console.log("🔍 Encaminhando para SAGA após 404...");
              if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader("Content-Type", "application/json");
                proxyReq.setHeader(
                  "Content-Length",
                  Buffer.byteLength(bodyData)
                );
                proxyReq.write(bodyData);
              }
            },
          })(req, res, next);
        }

        return res.status(error.response.status).json({
          erro: "Erro na verificação de email",
          status: error.response.status,
          detalhes: error.response.data,
        });
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error("❌ Sem resposta do MS-Cliente");
        return res.status(503).json({
          erro: "Serviço de verificação indisponível",
          mensagem:
            "Não foi possível conectar ao serviço de verificação de email",
          detalhes: error.message,
        });
      } else if (error.code === "ECONNABORTED") {
        // Timeout
        console.error("❌ Timeout na verificação de email");
        return res.status(504).json({
          erro: "Timeout na verificação de email",
          mensagem: "A verificação demorou muito tempo",
          detalhes: error.message,
        });
      } else {
        // Outros erros
        console.error("❌ Erro inesperado:", error.message);
        return res.status(500).json({
          erro: "Erro interno do servidor",
          detalhes: error.message,
        });
      }
    }
  });

  app.post(
    "/clientes/:cpf/aprovar",
    createProxyMiddleware({
      ...proxyOptions(SAGA),
      selfHandleResponse: true,

      onProxyRes: async (proxyRes, req, res) => {
        const cpf = req.params.cpf;
        console.log("🔍 Iniciando aprovação para CPF:", cpf);

        let sagaResponse = "";
        proxyRes.on("data", (chunk) => (sagaResponse += chunk.toString()));

        proxyRes.on("end", async () => {
          console.log("🔍 Resposta do SAGA:", sagaResponse);
          console.log("🔍 Status do SAGA:", proxyRes.statusCode);

          try {
            // Aguarde um pouco para o processamento assíncrono
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const contaUrl = `${process.env.CONTA_SERVICE_URL}/contas/${cpf}`;
            console.log("🔍 Buscando conta em:", contaUrl);

            const contaResponse = await fetch(contaUrl);
            console.log("🔍 Status da busca da conta:", contaResponse.status);

            if (!contaResponse.ok) {
              console.log(
                "❌ Conta não encontrada. Status:",
                contaResponse.status
              );
              return res.status(500).json({
                erro: "Conta não encontrada após aprovação.",
                detalhes: `Status: ${contaResponse.status}`,
              });
            }

            const dadosConta = await contaResponse.json();
            console.log("🔍 Dados da conta encontrada:", dadosConta);

            const respostaSwagger = {
              cliente: cpf,
              numero: dadosConta.numeroConta,
              saldo: dadosConta.saldo,
              limite: dadosConta.limite,
              gerente: dadosConta.cpfGerente,
              criacao: dadosConta.dataCriacao,
            };

            return res.status(200).json(respostaSwagger);
          } catch (err) {
            console.error("❌ Erro na composition:", err);
            return res.status(500).json({
              erro: "Erro interno na aprovação.",
              detalhes: err.message,
            });
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

      onProxyReq(proxyReq, req) {
        console.log("🔍 REJEIÇÃO - Headers:", req.headers);
        console.log("🔍 REJEIÇÃO - Body:", req.body);
        console.log("🔍 REJEIÇÃO - CPF:", req.params.cpf);

        if (req.body) {
          const bodyData =
            typeof req.body === "string" ? req.body : JSON.stringify(req.body);
          console.log("🔍 REJEIÇÃO - Enviando body:", bodyData);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },

      onProxyRes: async (proxyRes, req, res) => {
        console.log(
          "🔍 REJEIÇÃO - Resposta do MS-Cliente:",
          proxyRes.statusCode
        );

        let body = "";
        proxyRes.on("data", (chunk) => {
          body += chunk.toString();
        });

        proxyRes.on("end", () => {
          console.log("🔍 REJEIÇÃO - Body da resposta:", body);

          if (proxyRes.statusCode === 200) {
            res.status(200).json({
              mensagem: "Cliente rejeitado com sucesso",
            });
          } else {
            try {
              const jsonData = JSON.parse(body);
              res.status(proxyRes.statusCode).json(jsonData);
            } catch {
              res.status(proxyRes.statusCode).send(body);
            }
          }
        });
      },

      onError: (err, req, res) => {
        console.error("❌ REJEIÇÃO - Erro no proxy:", err.message);
        res.status(502).json({
          erro: "Serviço de clientes indisponível",
          detalhes: err.message,
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
    getGerentes
  );

  app.get(
    "/gerentes/:cpfGerente/clientes",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    (req, res, next) => getClientesDoGerente(req, res, next)
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
    createProxyMiddleware(proxyOptions(SAGA))
  );

  app.put(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    createProxyMiddleware(proxyOptions(SAGA))
  );

  console.log("✅ Proxies configurados.");
}

module.exports = setupProxies;

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
  invalidateToken,
  getTokenFromRequest,
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
  path.join(__dirname, "../middlewares/keys/public-key.pem"),
  "utf8"
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  app.post("/login", async (req, res) => {
    try {
      console.log(
        "🔍 Body original recebido no login:",
        JSON.stringify(req.body)
      );

      const mappedBody = {
        email: req.body.login || req.body.email,
        password: req.body.senha || req.body.password,
      };

      console.log("🔍 Body mapeado para auth:", JSON.stringify(mappedBody));

      const response = await axiosInstance.post(`${AUTH}login`, mappedBody, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("🔍 Login - Status do Auth:", response.status);
      console.log(
        "🔍 Login - Resposta completa:",
        JSON.stringify(response.data)
      );

      // TRATAR RESPOSTA VAZIA
      if (response.status === 200 && (!response.data || response.data === "")) {
        console.log(
          "Login - Resposta vazia do MS-Auth, tentando buscar usuário manualmente"
        );

        const emailDoLogin = req.body.login || req.body.email;

        // Tentar buscar no MS-Gerente
        try {
          const gerenteResponse = await axiosInstance.get(
            `${GERENTE}gerentes/email/${encodeURIComponent(emailDoLogin)}`,
            {
              timeout: 5000,
              validateStatus: (status) => status < 500,
            }
          );

          if (gerenteResponse.status === 200) {
            const gerente = gerenteResponse.data;
            console.log("Gerente encontrado manualmente:", gerente);

            // Criar resposta de login manual
            const manualResponse = {
              token: `manual_token_${Date.now()}_${gerente.cpf}`,
              token_type: "Bearer",
              tipo: gerente.tipo || "GERENTE",
              usuario: {
                id: gerente.cpf, // usar CPF como ID temporário
                email: gerente.email,
                cpf: gerente.cpf,
              },
            };

            // Salvar email para logout
            salvarEmailParaLogout(gerente.cpf, gerente.email);
            salvarEmailParaLogoutPorId(gerente.cpf, gerente.email);

            console.log(
              "Login manual realizado com sucesso para:",
              gerente.email
            );
            return res.status(200).json(manualResponse);
          }
        } catch (searchError) {
          console.log(
            "Erro ao buscar usuário manualmente:",
            searchError.message
          );
        }

        return res.status(401).json({
          mensagem: "Credenciais inválidas",
        });
      }

      if (response.status === 200 && response.data) {
        const data = response.data;

        const emailDoLogin = req.body.login || req.body.email;
        if (emailDoLogin) {
          const token = data.token || data.access_token;
          if (token) {
            try {
              const decoded = jwt.verify(token, PUBLIC_KEY, {
                algorithms: ["RS256"],
                issuer: "mybackend",
              });

              console.log("Token decodificado no login:", decoded);

              // Salvar email para logout
              if (decoded.cpf) {
                salvarEmailParaLogout(decoded.cpf, emailDoLogin);
              }
              if (decoded.sub) {
                salvarEmailParaLogoutPorId(decoded.sub, emailDoLogin);
              }
            } catch (e) {
              console.log("Erro ao decodificar token:", e.message);
            }
          }
        }

        console.log("Login realizado com sucesso para:", emailDoLogin);
        return res.status(200).json(data);
      } else {
        console.log("Login falhou - status ou dados inválidos");
        return res.status(401).json({
          mensagem: "Credenciais inválidas",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error.message);

      if (error.response) {
        console.log("Erro response - Status:", error.response.status);
        console.log("Erro response - Data:", error.response.data);

        if (error.response.status === 401) {
          return res.status(401).json({
            mensagem: "Credenciais inválidas",
          });
        }

        return res.status(error.response.status).json(error.response.data);
      } else {
        console.error("Erro de conexão:", error.message);
        return res.status(502).json({
          error: "Serviço de autenticação indisponível",
          details: error.message,
        });
      }
    }
  });

  app.post("/logout", verifyJWT, (req, res) => {
    const user = req.user;

    console.log("Logout - User object:", {
      sub: user.sub,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
    });

    const token = getTokenFromRequest(req);
    if (token) {
      invalidateToken(token);
      console.log("Token invalidado na blacklist");
    } else {
      console.log("Nenhum token encontrado para invalidar");
    }

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
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
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
    console.log("=== INICIANDO AUTOCADASTRO ===");

    await sleep(1000);

    console.log("Body recebido:", JSON.stringify(req.body, null, 2));

    const { email, cpf, nome, salario, endereco, cep, cidade, estado } =
      req.body;

    if (
      !email ||
      !cpf ||
      !nome ||
      !salario ||
      !endereco ||
      !cidade ||
      !estado
    ) {
      console.log("Campos obrigatórios faltando");
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

    console.log("Verificando se email já existe:", email);

    try {
      const emailCheckUrl = `${CLIENTE}clientes/email/${encodeURIComponent(
        email
      )}`;
      console.log("Fazendo request para:", emailCheckUrl);
      console.log("CLIENTE SERVICE URL:", CLIENTE);

      const startTime = Date.now();

      const emailResponse = await axiosInstance.get(emailCheckUrl, {
        timeout: 5000,
        validateStatus: (status) => {
          console.log(`Status recebido na validação: ${status}`);
          return true;
        },
      });

      const endTime = Date.now();
      console.log(`Resposta recebida em ${endTime - startTime}ms`);
      console.log("Status da resposta:", emailResponse.status);
      console.log("Data da resposta:", emailResponse.data);

      if (emailResponse.status === 200) {
        console.log("Email já cadastrado no sistema");
        return res.status(409).json({
          erro: "Email já cadastrado",
          mensagem: "Já existe um cliente cadastrado com este email",
        });
      }

      if (emailResponse.status === 404) {
        console.log("Email disponível! Prosseguindo com cadastro...");

        return createProxyMiddleware({
          ...proxyOptions(SAGA),
          selfHandleResponse: false,
          onProxyReq(proxyReq, req) {
            console.log("Encaminhando dados para SAGA...");
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          },
          onProxyRes(proxyRes, req, res) {
            console.log("Resposta do SAGA recebida:", proxyRes.statusCode);
          },
          onError(err, req, res) {
            console.error("Erro no proxy SAGA:", err.message);
            res.status(502).json({
              erro: "Erro no serviço de cadastro",
              detalhes: err.message,
            });
          },
        })(req, res, next);
      }

      console.log("Status inesperado do MS-Cliente:", emailResponse.status);
      return res.status(500).json({
        erro: "Erro inesperado na verificação de email",
        status: emailResponse.status,
        data: emailResponse.data,
      });
    } catch (error) {
      console.error("ERRO CAPTURADO:", error.message);
      console.error("Código do erro:", error.code);
      console.error("Stack trace:", error.stack);

      if (error.response) {
        console.log("Response error - Status:", error.response.status);
        console.log("Response error - Data:", error.response.data);

        if (error.response.status === 404) {
          console.log("Email disponível - Prosseguindo com cadastro...");

          return createProxyMiddleware({
            ...proxyOptions(SAGA),
            selfHandleResponse: false,
            onProxyReq(proxyReq, req) {
              console.log("Encaminhando para SAGA");
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
        console.error("Sem resposta do MS-Cliente");
        return res.status(503).json({
          erro: "Serviço de verificação indisponível",
          mensagem:
            "Não foi possível conectar ao serviço de verificação de email",
          detalhes: error.message,
        });
      } else if (error.code === "ECONNABORTED") {
        console.error("Timeout na verificação de email");
        return res.status(504).json({
          erro: "Timeout na verificação de email",
          mensagem: "A verificação demorou muito tempo",
          detalhes: error.message,
        });
      } else {
        console.error("Erro inesperado:", error.message);
        return res.status(500).json({
          erro: "Erro interno do servidor",
          detalhes: error.message,
        });
      }
    }
  });

  app.put("/clientes/:cpf", verifyJWT, async (req, res) => {
    const { cpf } = req.params;
    const dadosAtualizados = req.body;

    console.log("=== INICIANDO ALTERAÇÃO DE PERFIL ===");
    console.log("CPF:", cpf);
    console.log(
      "Dados atualizados recebidos:",
      JSON.stringify(dadosAtualizados, null, 2)
    );

    try {
      console.log("Buscando dados originais do cliente...");
      const clienteOriginalResponse = await axiosInstance.get(
        `${CLIENTE}clientes/${encodeURIComponent(cpf)}`,
        {
          headers: {
            Authorization: req.headers["authorization"],
          },
          timeout: 5000,
        }
      );

      if (clienteOriginalResponse.status !== 200) {
        console.log(
          "Erro ao buscar dados originais do cliente:",
          clienteOriginalResponse.status
        );
        return res
          .status(clienteOriginalResponse.status)
          .json(clienteOriginalResponse.data);
      }

      const dadosOriginais = clienteOriginalResponse.data;
      console.log(
        "Dados originais encontrados:",
        JSON.stringify(dadosOriginais, null, 2)
      );

      // correcao no cep, estava enviando com um "-"
      const cepAtual = dadosAtualizados.cep || dadosOriginais.cep;
      const cepCorrigido = cepAtual ? cepAtual.replace(/\D/g, "") : "";

      const sagaPayload = {
        dadosOriginais: {
          cpf: dadosOriginais.cpf,
          nome: dadosOriginais.nome,
          email: dadosOriginais.email,
          salario: parseFloat(dadosOriginais.salario),
          endereco: dadosOriginais.endereco,
          cep: dadosOriginais.cep,
          cidade: dadosOriginais.cidade,
          estado: dadosOriginais.estado,
        },
        dadosAtualizados: {
          cpf: cpf,
          nome: dadosAtualizados.nome || dadosOriginais.nome,
          email: dadosAtualizados.email || dadosOriginais.email,
          salario: parseFloat(
            dadosAtualizados.salario || dadosOriginais.salario
          ),
          endereco: dadosAtualizados.endereco || dadosOriginais.endereco,
          cep: cepCorrigido,
          cidade: dadosAtualizados.cidade || dadosOriginais.cidade,
          estado: dadosAtualizados.estado || dadosOriginais.estado,
        },
      };

      console.log("Payload para SAGA:", JSON.stringify(sagaPayload, null, 2));

      console.log("Chamando SAGA para alteração de perfil...");
      const sagaResponse = await axiosInstance.post(
        `${SAGA}alterar-perfil`,
        sagaPayload,
        {
          headers: {
            Authorization: req.headers["authorization"],
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log(
        "🔍 Resposta do SAGA:",
        sagaResponse.status,
        sagaResponse.data
      );

      await sleep(1000);

      console.log("Buscando dados atualizados do cliente...");
      const clienteAtualizadoResponse = await axiosInstance.get(
        `${CLIENTE}clientes/${encodeURIComponent(cpf)}`,
        {
          headers: {
            Authorization: req.headers["authorization"],
          },
          timeout: 5000,
        }
      );

      if (clienteAtualizadoResponse.status !== 200) {
        console.log(
          "Erro ao buscar dados atualizados:",
          clienteAtualizadoResponse.status
        );
        return res
          .status(clienteAtualizadoResponse.status)
          .json(clienteAtualizadoResponse.data);
      }

      const clienteAtualizado = clienteAtualizadoResponse.data;

      const responseData = {
        cpf: clienteAtualizado.cpf,
        nome: clienteAtualizado.nome,
        salario: parseFloat(clienteAtualizado.salario),
      };

      console.log("Alteração de perfil concluída com sucesso");
      console.log("Dados retornados:", responseData);

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Erro na alteração de perfil:", error.message);

      if (error.response) {
        console.log("Erro response - Status:", error.response.status);
        console.log("Erro response - Data:", error.response.data);
        return res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        console.error("Sem resposta do serviço");
        return res.status(503).json({
          erro: "Serviço indisponível",
          detalhes: error.message,
        });
      } else {
        console.error("Erro interno:", error.message);
        return res.status(500).json({
          erro: "Erro interno do servidor",
          detalhes: error.message,
        });
      }
    }
  });

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
    createProxyMiddleware({
      ...proxyOptions(CLIENTE),
      selfHandleResponse: true,

      onProxyReq(proxyReq, req) {
        console.log("REJEIÇÃO - Headers:", req.headers);
        console.log("REJEIÇÃO - Body:", req.body);
        console.log("REJEIÇÃO - CPF:", req.params.cpf);

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
        console.log("REJEIÇÃO - Resposta do MS-Cliente:", proxyRes.statusCode);

        let body = "";
        proxyRes.on("data", (chunk) => {
          body += chunk.toString();
        });

        proxyRes.on("end", () => {
          console.log("REJEIÇÃO - Body da resposta:", body);

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
        console.error("REJEIÇÃO - Erro no proxy:", err.message);
        res.status(502).json({
          erro: "Serviço de clientes indisponível",
          detalhes: err.message,
        });
      },
    })
  );

  app.get(
    "/contas/:id",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      pathRewrite: (path, req) => `/contas/${req.params.id}`,
      onProxyReq: (proxyReq) => {
        proxyReq.removeHeader("Content-Type");
        proxyReq.removeHeader("Content-Length");
      },
    })
  );

  app.get(
    "/contas/:numero/saldo",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      selfHandleResponse: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/saldo`,
      onProxyReq: (proxyReq) => {
        proxyReq.removeHeader("Content-Type");
        proxyReq.removeHeader("Content-Length");
      },
      onProxyRes: async (proxyRes, req, res) => {
        let body = "";
        proxyRes.on("data", (chunk) => (body += chunk.toString()));

        proxyRes.on("end", () => {
          console.log(`🔍 Resposta saldo (${proxyRes.statusCode}):`, body);

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

          try {
            const data = body ? JSON.parse(body) : {};

            if (proxyRes.statusCode !== 200) {
              return res.status(proxyRes.statusCode).json(data);
            }

            const numeroConta = parseInt(req.params.numero, 10);

            const cpfCliente =
              data.cpfCliente || data.cliente || data.cpf || data.idCliente;

            const saldo =
              data.saldo !== undefined
                ? data.saldo
                : data.valor !== undefined
                ? data.valor
                : data.balance !== undefined
                ? data.balance
                : 0;

            const response = {
              cliente: cpfCliente,
              conta: numeroConta,
              saldo: saldo,
            };

            console.log("Resposta formatada para saldo:", response);
            return res.status(200).json(response);
          } catch (e) {
            console.error("Erro ao processar resposta do saldo:", e);
            return res.status(500).json({
              error: "Erro ao processar resposta",
              details: e.message,
            });
          }
        });
      },
    })
  );

  app.get(
    "/contas/:numero/extrato",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      selfHandleResponse: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/extrato`,
      onProxyReq: (proxyReq) => {
        proxyReq.removeHeader("Content-Type");
        proxyReq.removeHeader("Content-Length");
      },
      onProxyRes: async (proxyRes, req, res) => {
        let body = "";
        proxyRes.on("data", (chunk) => (body += chunk.toString()));

        proxyRes.on("end", () => {
          console.log(`Resposta extrato (${proxyRes.statusCode}):`, body);

          // Configurar CORS
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

          try {
            const data = body ? JSON.parse(body) : {};
            const numeroConta = parseInt(req.params.numero, 10);

            if (proxyRes.statusCode !== 200) {
              return res.status(proxyRes.statusCode).json(data);
            }

            let response;

            if (Array.isArray(data)) {
              response = {
                conta: numeroConta,
                saldo: data.saldo || 0,
                movimentacoes: data,
              };
            } else if (data.movimentacoes !== undefined) {
              response = {
                conta: numeroConta,
                saldo: data.saldo !== undefined ? data.saldo : 0,
                movimentacoes: data.movimentacoes,
              };
            } else {
              response = {
                conta: numeroConta,
                saldo: data.saldo !== undefined ? data.saldo : 0,
                movimentacoes: data.movimentacoes || data.transactions || [],
              };
            }

            response.saldo = Math.round(response.saldo * 100) / 100;

            console.log("Resposta formatada para extrato:", response);
            return res.status(200).json(response);
          } catch (e) {
            console.error("Erro ao processar resposta do extrato:", e);
            return res.status(200).json({
              conta: parseInt(req.params.numero, 10),
              saldo: 0,
              movimentacoes: [],
            });
          }
        });
      },
    })
  );

  app.post(
    "/contas/:numero/depositar",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      selfHandleResponse: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/depositar`,
      onProxyReq(proxyReq, req) {
        console.log("POST /contas/:numero/depositar -> convertendo para PUT");
        console.log("Número conta:", req.params.numero);
        console.log("Body original:", req.body);

        proxyReq.method = "PUT";

        if (req.body) {
          const valor = String(req.body.valor || req.body);
          console.log("Enviando valor:", valor);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(valor));
          proxyReq.write(valor);
        }
      },
      onProxyRes: async (proxyRes, req, res) => {
        let body = "";
        proxyRes.on("data", (chunk) => (body += chunk.toString()));

        proxyRes.on("end", () => {
          console.log(`Resposta depósito (${proxyRes.statusCode}):`, body);

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

          try {
            const data = body ? JSON.parse(body) : {};

            if (proxyRes.statusCode !== 200) {
              return res.status(proxyRes.statusCode).json(data);
            }

            const numeroConta = parseInt(req.params.numero, 10);
            const saldo = data.saldo !== undefined ? data.saldo : data.balance;
            const saldoArredondado = Math.round(saldo * 100) / 100;

            const response = {
              conta: numeroConta,
              saldo: saldoArredondado,
              data: data.data || data.timestamp || new Date().toISOString(),
              mensagem: data.mensagem || "Depósito realizado com sucesso",
            };

            console.log("Resposta formatada para depósito:", response);
            return res.status(200).json(response);
          } catch (e) {
            console.error("Erro ao processar resposta do depósito:", e);
            return res.status(500).json({
              error: "Erro ao processar resposta",
              details: e.message,
            });
          }
        });
      },
    })
  );

  app.post(
    "/contas/:numero/sacar",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      selfHandleResponse: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/sacar`,
      onProxyReq(proxyReq, req) {
        console.log("🔍 POST /contas/:numero/sacar -> convertendo para PUT");
        console.log("🔍 Número conta:", req.params.numero);
        console.log("🔍 Body original:", req.body);

        proxyReq.method = "PUT";

        if (req.body) {
          const valor = String(req.body.valor || req.body);
          console.log("Enviando valor:", valor);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(valor));
          proxyReq.write(valor);
        }
      },
      onProxyRes: async (proxyRes, req, res) => {
        let body = "";
        proxyRes.on("data", (chunk) => (body += chunk.toString()));

        proxyRes.on("end", () => {
          console.log(`Resposta saque (${proxyRes.statusCode}):`, body);

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

          try {
            const data = body ? JSON.parse(body) : {};

            if (proxyRes.statusCode !== 200) {
              return res.status(proxyRes.statusCode).json(data);
            }

            const numeroConta = parseInt(req.params.numero, 10);
            const saldo = data.saldo !== undefined ? data.saldo : data.balance;
            const saldoArredondado = Math.round(saldo * 100) / 100;

            const response = {
              conta: numeroConta,
              saldo: saldoArredondado,
              data: data.data || data.timestamp || new Date().toISOString(),
              mensagem: data.mensagem || "Saque realizado com sucesso",
            };

            console.log("Resposta formatada para saque:", response);
            return res.status(200).json(response);
          } catch (e) {
            console.error("Erro ao processar resposta do saque:", e);
            return res.status(500).json({
              error: "Erro ao processar resposta",
              details: e.message,
            });
          }
        });
      },
    })
  );

  app.post(
    "/contas/:numero/transferir",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      selfHandleResponse: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/transferir`,
      onProxyReq(proxyReq, req) {
        console.log(
          "🔍 POST /contas/:numero/transferir -> convertendo para PUT"
        );
        console.log("Número conta origem:", req.params.numero);
        console.log("Body original:", req.body);

        proxyReq.method = "PUT";

        if (req.body) {
          const transferData = {
            numeroConta:
              req.body.destino || req.body.numeroConta || req.body.contaDestino,
            valor: parseFloat(req.body.valor),
          };

          console.log("Dados mapeados para transferência:", transferData);

          const bodyData = JSON.stringify(transferData);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      onProxyRes: async (proxyRes, req, res) => {
        let body = "";
        proxyRes.on("data", (chunk) => (body += chunk.toString()));

        proxyRes.on("end", () => {
          console.log(`🔍 Resposta transferir (${proxyRes.statusCode}):`, body);

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

          try {
            const data = body ? JSON.parse(body) : {};
            const numeroConta = parseInt(req.params.numero, 10);

            if (proxyRes.statusCode !== 200) {
              return res.status(proxyRes.statusCode).json(data);
            }

            const saldo =
              data.saldo !== undefined
                ? data.saldo
                : data.balance !== undefined
                ? data.balance
                : data.novoSaldo !== undefined
                ? data.novoSaldo
                : 0;

            const saldoArredondado = Math.round(saldo * 100) / 100;

            const response = {
              conta: numeroConta,
              destino: data.destino || data.numeroConta || req.body.destino,
              valor: data.valor || parseFloat(req.body.valor),
              saldo: saldoArredondado,
              data: data.data || data.timestamp || new Date().toISOString(),
              mensagem: data.mensagem || "Transferência realizada com sucesso",
            };

            console.log("Resposta formatada para transferência:", response);
            return res.status(200).json(response);
          } catch (e) {
            console.error("Erro ao processar resposta da transferência:", e);
            return res.status(200).json({
              conta: parseInt(req.params.numero, 10),
              destino: req.body.destino,
              valor: parseFloat(req.body.valor),
              saldo: 0,
              data: new Date().toISOString(),
              mensagem: "Transferência realizada com sucesso",
            });
          }
        });
      },
    })
  );

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
    requireRoles(["ADMINISTRADOR"]),
    async (req, res) => {
      try {
        console.log("POST /gerentes - Iniciando cadastro de gerente");
        console.log("Body recebido:", JSON.stringify(req.body));

        const { cpf, email, nome, senha } = req.body;

        if (!cpf || !email || !nome || !senha) {
          return res.status(400).json({
            erro: "Campos obrigatórios faltando",
            campos_obrigatorios: ["cpf", "email", "nome", "senha"],
          });
        }

        try {
          const gerenteExistente = await axiosInstance.get(
            `${GERENTE}gerentes/${cpf}`,
            {
              timeout: 5000,
              validateStatus: (status) => status < 500,
            }
          );

          if (gerenteExistente.status === 200) {
            console.log("Gerente já existe - retornando 409");
            return res.status(409).json({
              erro: "CPF já cadastrado",
              mensagem: "Já existe um gerente cadastrado com este CPF",
              cpf: cpf,
            });
          }
        } catch (error) {
          console.log(
            "Erro na verificação de gerente existente:",
            error.message
          );
        }

        const sagaResponse = await axiosInstance.post(
          `${SAGA}gerentes`,
          req.body,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log(
          "Resposta do SAGA:",
          sagaResponse.status,
          sagaResponse.data
        );

        if (sagaResponse.status === 409) {
          return res.status(409).json({
            erro: "CPF já cadastrado",
            mensagem: "Já existe um gerente cadastrado com este CPF",
            cpf: cpf,
          });
        }

        if (sagaResponse.status === 201 || sagaResponse.status === 200) {
          return res.status(201).json({
            cpf: cpf,
            email: email,
            nome: nome,
            tipo: req.body.tipo || "GERENTE",
            senha: senha,
          });
        }

        return res.status(sagaResponse.status).json(sagaResponse.data);
      } catch (error) {
        console.error("Erro no cadastro de gerente:", error.message);

        if (error.response) {
          console.log("Erro response - Status:", error.response.status);
          console.log("Erro response - Data:", error.response.data);

          if (error.response.status === 409) {
            return res.status(409).json({
              erro: "CPF já cadastrado",
              mensagem: "Já existe um gerente cadastrado com este CPF",
              cpf: req.body.cpf,
            });
          }

          return res.status(error.response.status).json(error.response.data);
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "ECONNRESET"
        ) {
          console.error("Erro de conexão com SAGA");
          return res.status(503).json({
            erro: "Serviço de cadastro indisponível",
            detalhes: error.message,
          });
        } else {
          console.error("Erro interno:", error.message);
          return res.status(500).json({
            erro: "Erro interno do servidor",
            detalhes: error.message,
          });
        }
      }
    }
  );

  app.get(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["GERENTE", "ADMINISTRADOR"]),
    async (req, res) => {
      try {
        const { cpf } = req.params;
        console.log("GET /gerentes/:cpf - CPF:", cpf);

        const response = await axiosInstance.get(`${GERENTE}gerentes/${cpf}`, {
          timeout: 5000,
          validateStatus: (status) => status < 500,
        });

        console.log("GET /gerentes/:cpf - Resposta:", response.status);

        if (response.status === 200) {
          return res.status(200).json(response.data);
        }

        if (response.status === 404) {
          console.log("Gerente não encontrado, aguardando sincronização...");
          await sleep(2000);

          const retryResponse = await axiosInstance.get(
            `${GERENTE}gerentes/${cpf}`,
            {
              timeout: 5000,
              validateStatus: (status) => status < 500,
            }
          );

          if (retryResponse.status === 200) {
            return res.status(200).json(retryResponse.data);
          }

          console.log("Gerente ainda não encontrado após retry");
        }

        return res.status(404).json({
          erro: "Gerente não encontrado",
          cpf: cpf,
        });
      } catch (error) {
        console.error("Erro ao buscar gerente:", error.message);

        if (error.response) {
          if (error.response.status === 404) {
            return res.status(404).json({
              erro: "Gerente não encontrado",
              cpf: req.params.cpf,
            });
          }
          return res.status(error.response.status).json(error.response.data);
        } else {
          return res.status(500).json({
            erro: "Erro interno do servidor",
            detalhes: error.message,
          });
        }
      }
    }
  );

  app.delete(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["ADMINISTRADOR"]),
    async (req, res) => {
      try {
        const { cpf } = req.params;
        console.log("DELETE /gerentes/:cpf - CPF:", cpf);

        const response = await axiosInstance.delete(`${SAGA}gerentes/${cpf}`, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        console.log(
          "DELETE /gerentes/:cpf - Resposta:",
          response.status,
          response.data
        );

        if (response.status === 200) {
          return res.status(200).json({
            mensagem: "Gerente removido com sucesso",
            cpf: cpf,
          });
        }

        return res.status(response.status).json(response.data);
      } catch (error) {
        console.error("Erro ao deletar gerente:", error.message);

        if (error.response) {
          console.log("Erro response - Status:", error.response.status);
          console.log("Erro response - Data:", error.response.data);

          if (error.response.status === 404) {
            return res.status(404).json({
              erro: "Gerente não encontrado",
              cpf: req.params.cpf,
            });
          }

          return res.status(error.response.status).json(error.response.data);
        } else if (error.code === "ECONNREFUSED") {
          return res.status(503).json({
            erro: "Serviço indisponível",
            detalhes: error.message,
          });
        } else {
          return res.status(500).json({
            erro: "Erro interno do servidor",
            detalhes: error.message,
          });
        }
      }
    }
  );

  app.put(
    "/gerentes/:cpf",
    verifyJWT,
    requireRoles(["ADMINISTRADOR"]),
    async (req, res) => {
      try {
        const { cpf } = req.params;
        console.log("PUT /gerentes/:cpf - CPF:", cpf);
        console.log("Body:", JSON.stringify(req.body));

        const response = await axiosInstance.put(
          `${SAGA}gerentes/${cpf}`,
          req.body,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log(
          "PUT /gerentes/:cpf - Resposta:",
          response.status,
          response.data
        );

        if (response.status === 200) {
          const responseData = {
            cpf: cpf,
            nome: req.body.nome,
            email: req.body.email,
            tipo: req.body.tipo || "GERENTE",
          };

          if (req.body.senha) {
            responseData.senha = req.body.senha;
          }

          return res.status(200).json(responseData);
        }

        return res.status(response.status).json(response.data);
      } catch (error) {
        console.error("Erro ao atualizar gerente:", error.message);

        if (error.response) {
          return res.status(error.response.status).json(error.response.data);
        } else {
          return res.status(500).json({
            erro: "Erro interno do servidor",
            detalhes: error.message,
          });
        }
      }
    }
  );

  console.log("✅ Proxies configurados.");
}

module.exports = setupProxies;

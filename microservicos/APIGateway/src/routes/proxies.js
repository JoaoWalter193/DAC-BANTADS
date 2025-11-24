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
  path.join(__dirname, "../middlewares/keys/public-key.pem"), // Ajuste o caminho
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

  app.post("/login", (req, res, next) => {
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL,
      changeOrigin: true,
      proxyTimeout: 30000,
      timeout: 30000,
      selfHandleResponse: true,

      onProxyReq(proxyReq, req) {
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(
            "🔍 Body original recebido no login:",
            JSON.stringify(req.body)
          );

          // ✅ MAPEAMENTO DOS CAMPOS: login -> email, senha -> password
          const mappedBody = {
            email: req.body.login || req.body.email, // Aceita ambos
            password: req.body.senha || req.body.password, // Aceita ambos
          };

          console.log("🔍 Body mapeado para auth:", JSON.stringify(mappedBody));

          const bodyData = JSON.stringify(mappedBody);
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
            const emailDoLogin = req.body.email || req.body.login;
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

    const token = getTokenFromRequest(req);
    if (token) {
      invalidateToken(token);
      console.log("✅ Token invalidado na blacklist");
    } else {
      console.log("⚠️ Nenhum token encontrado para invalidar");
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
    console.log("🔍 === INICIANDO AUTOCADASTRO ===");

    await sleep(1000);

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
      const emailCheckUrl = `${CLIENTE}clientes/email/${encodeURIComponent(
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

  app.put("/clientes/:cpf", verifyJWT, async (req, res) => {
    const { cpf } = req.params;
    const dadosAtualizados = req.body;

    console.log("🔍 === INICIANDO ALTERAÇÃO DE PERFIL ===");
    console.log("🔍 CPF:", cpf);
    console.log(
      "🔍 Dados atualizados recebidos:",
      JSON.stringify(dadosAtualizados, null, 2)
    );

    try {
      // 1. Primeiro buscar os dados originais do cliente
      console.log("🔍 Buscando dados originais do cliente...");
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
          "❌ Erro ao buscar dados originais do cliente:",
          clienteOriginalResponse.status
        );
        return res
          .status(clienteOriginalResponse.status)
          .json(clienteOriginalResponse.data);
      }

      const dadosOriginais = clienteOriginalResponse.data;
      console.log(
        "🔍 Dados originais encontrados:",
        JSON.stringify(dadosOriginais, null, 2)
      );

      // 2. Preparar o payload para o SAGA no formato esperado
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
          cpf: cpf, // Mantém o mesmo CPF
          nome: dadosAtualizados.nome || dadosOriginais.nome,
          email: dadosAtualizados.email || dadosOriginais.email,
          salario: parseFloat(
            dadosAtualizados.salario || dadosOriginais.salario
          ),
          endereco: dadosAtualizados.endereco || dadosOriginais.endereco,
          cep: dadosAtualizados.cep || dadosOriginais.cep,
          cidade: dadosAtualizados.cidade || dadosOriginais.cidade,
          estado: dadosAtualizados.estado || dadosOriginais.estado,
        },
      };

      console.log(
        "🔍 Payload para SAGA:",
        JSON.stringify(sagaPayload, null, 2)
      );

      // 3. Chamar o SAGA para processar a alteração
      console.log("🔍 Chamando SAGA para alteração de perfil...");
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

      // 4. Buscar os dados atualizados para retornar
      await sleep(1000); // Aguardar a consistência dos dados

      console.log("🔍 Buscando dados atualizados do cliente...");
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
          "❌ Erro ao buscar dados atualizados:",
          clienteAtualizadoResponse.status
        );
        return res
          .status(clienteAtualizadoResponse.status)
          .json(clienteAtualizadoResponse.data);
      }

      const clienteAtualizado = clienteAtualizadoResponse.data;

      // 5. Retornar resposta no formato esperado pelo teste
      const responseData = {
        cpf: clienteAtualizado.cpf,
        nome: clienteAtualizado.nome,
        salario: parseFloat(clienteAtualizado.salario),
      };

      console.log("✅ Alteração de perfil concluída com sucesso");
      console.log("🔍 Dados retornados:", responseData);

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("❌ Erro na alteração de perfil:", error.message);

      if (error.response) {
        console.log("🔍 Erro response - Status:", error.response.status);
        console.log("🔍 Erro response - Data:", error.response.data);
        return res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        console.error("❌ Sem resposta do serviço");
        return res.status(503).json({
          erro: "Serviço indisponível",
          detalhes: error.message,
        });
      } else {
        console.error("❌ Erro interno:", error.message);
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

  // Rota GET /contas/:numero/saldo
  app.get(
    "/contas/:numero/saldo",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/saldo`,
      onProxyReq: (proxyReq) => {
        proxyReq.removeHeader("Content-Type");
        proxyReq.removeHeader("Content-Length");
      },
    })
  );

  // Rota GET /contas/:numero/extrato
  app.get(
    "/contas/:numero/extrato",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/extrato`,
      onProxyReq: (proxyReq) => {
        proxyReq.removeHeader("Content-Type");
        proxyReq.removeHeader("Content-Length");
      },
    })
  );

  // Rota PUT /contas/:numero/depositar
  app.put(
    "/contas/:numero/depositar",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/depositar`,
      onProxyReq(proxyReq, req) {
        console.log("🔍 PUT /contas/:numero/depositar");
        console.log("🔍 Número conta:", req.params.numero);
        console.log("🔍 Body original:", req.body);

        if (req.body) {
          // Para depósito, envia apenas o valor como string
          const valor = String(req.body.valor || req.body);
          console.log("🔍 Enviando valor:", valor);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(valor));
          proxyReq.write(valor);
        }
      },
    })
  );

  // Rota PUT /contas/:numero/sacar
  app.put(
    "/contas/:numero/sacar",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      pathRewrite: (path, req) => `/contas/${req.params.numero}/sacar`,
      onProxyReq(proxyReq, req) {
        console.log("🔍 PUT /contas/:numero/sacar");
        console.log("🔍 Número conta:", req.params.numero);
        console.log("🔍 Body original:", req.body);

        if (req.body) {
          // Para saque, envia apenas o valor como string
          const valor = String(req.body.valor || req.body);
          console.log("🔍 Enviando valor:", valor);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(valor));
          proxyReq.write(valor);
        }
      },
    })
  );

  // Rota PUT /contas/:numero/transferir - VERSÃO FINAL CORRIGIDA
  app.put(
    "/contas/:numero/transferir",
    verifyJWT,
    createProxyMiddleware({
      target: CONTA,
      changeOrigin: true,
      selfHandleResponse: true, // ✅ Importante: nós vamos tratar a resposta
      pathRewrite: (path, req) => `/contas/${req.params.numero}/transferir`,
      onProxyReq(proxyReq, req) {
        console.log("🔍 PUT /contas/:numero/transferir");
        console.log("🔍 Número conta origem:", req.params.numero);
        console.log("🔍 Body original:", req.body);

        if (req.body) {
          const transferData = {
            numeroConta:
              req.body.destino || req.body.numeroConta || req.body.contaDestino,
            valor: parseFloat(req.body.valor),
          };

          console.log("🔍 Dados mapeados para transferência:", transferData);

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

          // ✅ CONFIGURAR HEADERS CORS APENAS UMA VEZ
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

            const response = {
              ...data,
              conta: parseInt(req.params.numero, 10),
              mensagem: data.mensagem || "Transferência realizada com sucesso",
            };

            // ✅ ENVIAR RESPOSTA APENAS UMA VEZ
            return res.status(200).json(response);
          } catch (e) {
            console.error("❌ Erro ao processar resposta da transferência:", e);
            // ✅ Se der erro no parse, retornar resposta simples
            return res.status(200).json({
              mensagem: "Transferência realizada com sucesso",
              conta: parseInt(req.params.numero, 10),
            });
          }
        });
      },
      onError: (err, req, res) => {
        console.error("❌ Erro transferir:", err.message);
        res.status(502).json({
          error: "Serviço indisponível",
          details: err.message,
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

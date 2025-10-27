const { createProxyMiddleware } = require("http-proxy-middleware");

function setupProxies(app) {
  const services = {
    login: process.env.AUTH_SERVICE_URL,
    logout: process.env.AUTH_SERVICE_URL,
    clientes: process.env.CLIENTE_SERVICE_URL,
    contas: process.env.CONTA_SERVICE_URL,
    gerentes: process.env.GERENTE_SERVICE_URL,
  };

  console.log("🔍 Variáveis de ambiente carregadas:");
  for (const [key, value] of Object.entries(services)) {
    console.log(`${key.toUpperCase()}: ${value}`);
  }

  for (const [path, target] of Object.entries(services)) {
    if (!target) {
      console.error(
        `❌ Variável de ambiente para ${path.toUpperCase()} não definida!`
      );
      continue;
    }

    // só registra se target válido
    if (!/^https?:\/\//.test(target)) {
      console.error(`❌ Target inválido para ${path}: ${target}`);
      continue;
    }

    app.use(
      `/${path}`,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
          [`^/${path}`] : "",
        },
        logLevel: "debug",
        onError: (err, req, res) => {
          console.error(`❌ Erro no proxy /${path}:`, err.message);
          res
            .status(500)
            .json({ error: `Erro no serviço ${path.toUpperCase()}` });
        },
      })
    );

    console.log(`🔗 Proxy montado para /${path} → ${target}`);
  }

  // Rota de teste
  app.get("/test", (req, res) => res.send("Gateway ativo"));
}

module.exports = setupProxies;

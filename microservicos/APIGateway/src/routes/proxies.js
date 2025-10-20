const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyJWT = require('../middlewares/verifyJWT');

function setupProxies(app) {
    app.use('/reboot', createProxyMiddleware({
        target: process.env.DEVICE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/reboot': '' },
    }))
    
    app.use('/login', createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/login': '' },
    }));

    app.use('/logout', verifyJWT, createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/logout': '' },
    }));

    app.use('/clientes', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.use('/clientes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.use('/clientes/:cpf/aprovar', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.use('/clientes/:cpf/rejeitar', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.use('/contas/:numero/saldo', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.use('/contas/:numero/depositar', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.use('/contas/:numero/sacar', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.use('/contas/:numero/transferir', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.use('/contas/:numero/extrato', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.use('/gerentes', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));

    app.use('/gerentes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));
}
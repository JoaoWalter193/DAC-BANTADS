const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyJWT = require('../middlewares/verifyJWT');

function setupProxies(app) {
    app.get('/reboot', createProxyMiddleware({
        target: process.env.DEVICE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/reboot': '' },
    }))
    
    app.post('/login', createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/login': '' },
    }));

    app.post('/logout', verifyJWT, createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/logout': '' },
    }));

    app.get('/clientes', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));
        
    app.post('/clientes', createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.get('/clientes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.put('/clientes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.post('/clientes/:cpf/aprovar', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.post('/clientes/:cpf/rejeitar', verifyJWT, createProxyMiddleware({
        target: process.env.CLIENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/clientes': '' },
    }));

    app.post('/contas/:numero/saldo', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.post('/contas/:numero/depositar', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.post('/contas/:numero/sacar', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.post('/contas/:numero/transferir', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.post('/contas/:numero/extrato', verifyJWT, createProxyMiddleware({
        target: process.env.CONTA_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/contas': '' },
    }));

    app.get('/gerentes', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));

    app.post('/gerentes', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));

    app.get('/gerentes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));

    app.delete('/gerentes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));

    app.put('/gerentes/:cpf', verifyJWT, createProxyMiddleware({
        target: process.env.GERENTE_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/gerentes': '' },
    }));
}
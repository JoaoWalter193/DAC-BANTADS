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

    
}
module.exports = {
    DEVICE: process.env.DEVICE_SERVICE_URL,
    AUTH: process.env.AUTH_SERVICE_URL,
    CLIENTE: process.env.CLIENTE_SERVICE_URL,
    CONTA: process.env.CONTA_SERVICE_URL,
    GERENTE: process.env.GERENTE_SERVICE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'segredo',
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || 1),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    PORT: parseInt(process.env.PORT || 3000),
}
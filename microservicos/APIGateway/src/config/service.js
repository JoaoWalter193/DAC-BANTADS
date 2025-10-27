require('dotenv').config();

module.exports = {
    AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:8082',
    CLIENTE: process.env.CLIENTE_SERVICE_URL || 'http://localhost:8083',
    CONTA: process.env.CONTA_SERVICE_URL || 'http://localhost:8080',
    GERENTE: process.env.GERENTE_SERVICE_URL  || 'http://localhost:8081',
    JWT_SECRET: process.env.JWT_SECRET || 'segredo',
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || 1),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    PORT: parseInt(process.env.PORT || 3000),
}
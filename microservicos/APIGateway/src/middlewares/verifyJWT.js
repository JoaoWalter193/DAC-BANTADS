const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const token = req.header['x-access-token'];

    if (!token) {
        return res.status(401).json({ auth: false, message: 'Nenhum token fornecido.' });
    }

    jwt.verify(token, process.env.GATEWAY_JWT_SECRET || 'segredo', (err, decoded) => {
        if (err) {
            return res.status(401).json({ auth: false, message: 'Falha ao autenticar.' });
        }

        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyJWT;
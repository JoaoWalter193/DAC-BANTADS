function errorHandler(err, req, res, next) {
    console.error('Erro no Gateway:', err.stack);
    
    res.status(500).json({
        error: 'Erro interno do servidor no Gateway.',
        message: err.message,
    });
}

module.exports = errorHandler;
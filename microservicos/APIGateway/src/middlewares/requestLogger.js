const morgan = require('morgan');

module.exports = morgan(':method :url :status :res[content-length] - :response-time ms');
const axios = require("axios");

const axiosInstance = axios.create({
  timeout: 30000,
  validateStatus: function (status) {
    return status < 500;
  },
});

function propagateRemoteError(res, remoteResponse) {
  console.error("❌ Erro remoto:", remoteResponse.status, remoteResponse.data);
  try {
    return res.status(remoteResponse.status).json(remoteResponse.data);
  } catch (e) {
    return res.status(remoteResponse.status).json({
      mensagem: "Erro no serviço remoto",
      status: remoteResponse.status,
    });
  }
}

module.exports = {
  axiosInstance,
  propagateRemoteError,
};

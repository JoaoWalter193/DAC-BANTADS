const axios = require('axios');

const axiosInstance = axios.create({
  timeout: 30_000,
  validateStatus: null,
});

function propagateRemoteError(res, remoteResponse) {
  const status = remoteResponse?.status || 500;
  const data = remoteResponse?.data;

  if (!data || (Object.keys(data).length === 0 && data.constructor === Object)) {
    return res.status(status).end();
  }
  return res.status(status).json(data);
}

module.exports = { axiosInstance, propagateRemoteError };
const express = require("express");
const { axiosInstance, propagateRemoteError } = require("./shared");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyJWT, requireRoles } = require("../../middlewares/verifyJWT");

const router = express.Router();

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

async function fetchCliente(cpf) {
  const url = `${CLIENTE}/clientes/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

async function fetchConta(cpf) {
  const url = `${CONTA}/contas/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

async function fetchGerente(cpf) {
  const url = `${GERENTE}/gerentes/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

router.get("/:cpf", verifyJWT, async (req, res) => {
  const { cpf } = req.params;

  try {
    const cliente = await fetchCliente(cpf);
    const conta = await fetchConta(cpf);
    const gerente = await fetchGerente(conta.cpfGerente);

    return res.status(200).json({
      cpf: cliente.cpf,
      nome: cliente.nome,
      email: cliente.email,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      salario: cliente.salario,
      conta: String(conta.numConta),
      saldo: conta.saldo,
      limite: conta.limite,
      gerente: gerente.cpf,
      gerente_nome: gerente.nome,
      gerente_email: gerente.email,
    });
  } catch (err) {
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
});

router.get("/", verifyJWT, async (req, res, next) => {
  const { filtro } = req.query;

  if (filtro === "adm_relatorio_clientes") {
    if (req.user?.role !== "ADMINISTRADOR") {
      return res.status(403).json({
        mensagem: "O usuário não tem permissão para efetuar esta operação",
      });
    }

    try {
      const clientesUrl = `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`;
      const clientesResp = await axiosInstance.get(clientesUrl);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];

      const final = clientes.map((c) => ({
        cpf: c.cpf,
        nome: c.nome,
        email: c.email,
        salario: c.salario ?? null,
        endereco: c.endereco,
        cidade: c.cidade,
        estado: c.estado,
      }));

      return res.status(200).json(final);
    } catch (err) {
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (filtro === "melhores_clientes") {
    if (req.user?.role !== "GERENTE") {
      return res.status(403).json({
        mensagem: "O usuário não tem permissão para efetuar esta operação",
      });
    }

    try {
      const contasResp = await axiosInstance.get(
        `${CONTA}/contas/melhoresClientes`
      );
      if (contasResp.status >= 400)
        return propagateRemoteError(res, contasResp);

      const contas = contasResp.data || [];

      const clientesResp = await Promise.all(
        contas.map((c) => fetchCliente(c.cpfCliente))
      );

      const final = clientesResp.map((cliente) => ({
        cpf: cliente.cpf,
        nome: cliente.nome,
        email: cliente.email,
        salario: cliente.salario ?? null,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
      }));

      return res.status(200).json(final);
    } catch (err) {
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (!filtro) {
    if (req.user?.role !== "GERENTE") {
      return res.status(403).json({
        mensagem: "O usuário não tem permissão para efetuar esta operação",
      });
    }

    try {
      const allClientesResp = await axiosInstance.get(`${CLIENTE}/clientes`);
      if (allClientesResp.status >= 400)
        return propagateRemoteError(res, allClientesResp);

      const clientes = allClientesResp.data || [];

      const clientesComConta = [];

      for (const c of clientes) {
        try {
          await fetchConta(c.cpf);
          clientesComConta.push(c);
        } catch (_) {}
      }

      const final = clientesComConta.map((c) => ({
        cpf: c.cpf,
        nome: c.nome,
        email: c.email,
        salario: c.salario ?? null,
        endereco: c.endereco,
        cidade: c.cidade,
        estado: c.estado,
      }));

      return res.status(200).json(final);
    } catch (err) {
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (filtro === "para_aprovar") {
    if (req.user?.role !== "GERENTE") {
      return res.status(403).json({
        mensagem: "O usuário não tem permissão para efetuar esta operação",
      });
    }

    return createProxyMiddleware({
      target: CLIENTE,
      changeOrigin: true,
    })(req, res, next);
  }

  return createProxyMiddleware({
    target: CLIENTE,
    changeOrigin: true,
  })(req, res, next);
});

module.exports = router;

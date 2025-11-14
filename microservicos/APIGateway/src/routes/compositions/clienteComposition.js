const express = require("express");
const { axiosInstance, propagateRemoteError } = require("./shared");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyJWT, requireRoles } = require("../../middlewares/verifyJWT");

const router = express.Router();

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn(
    "Composition (cliente): alguma SERVICE_URL não está definida (CLIENTE/CONTA/GERENTE)."
  );
}

async function fetchContaByCpf(cpf) {
  const url = `${CONTA}/contas/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

async function fetchGerenteByCpf(cpf) {
  const url = `${GERENTE}/gerentes/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

router.get("/:cpf", verifyJWT, async (req, res) => {
  const { cpf } = req.params;

  try {
    const clienteUrl = `${CLIENTE}/clientes/${encodeURIComponent(cpf)}`;
    const clienteResp = await axiosInstance.get(clienteUrl);
    if (clienteResp.status >= 400)
      return propagateRemoteError(res, clienteResp);

    const cliente = clienteResp.data;

    let conta;
    try {
      conta = await fetchContaByCpf(cpf);
    } catch (e) {
      return propagateRemoteError(res, e.remote);
    }

    const cpfGerente = conta.cpfGerente;

    if (!cpfGerente) {
      return res.status(404).json({ mensagem: "Gerente não encontrado" });
    }

    let gerente;
    try {
      gerente = await fetchGerenteByCpf(cpfGerente);
    } catch (e) {
      return propagateRemoteError(res, e.remote);
    }

    const result = {
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
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro composition GET /clientes/:cpf", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
});

router.get(
  "/",
  verifyJWT,
  requireRoles(["GERENTE", "ADMINISTRADOR"]),
  async (req, res, next) => {
    const { filtro } = req.query;

    if (filtro === "adm_relatorio_clientes") {
      try {
        const clientesUrl = `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`;
        const clientesResp = await axiosInstance.get(clientesUrl);

        if (clientesResp.status >= 400)
          return propagateRemoteError(res, clientesResp);

        const clientes = clientesResp.data || [];

        const contasResponses = await Promise.all(
          clientes.map((c) => axiosInstance.get(`${CONTA}/contas/${c.cpf}`))
        );
        const contasData = contasResponses.map((r) => r.data);

        const gerentesResponses = await Promise.all(
          contasData.map((conta) =>
            axiosInstance.get(`${GERENTE}/gerentes/${conta.cpfGerente}`)
          )
        );
        const gerentesData = gerentesResponses.map((r) => r.data);

        const final = clientes.map((cliente, i) => {
          const conta = contasData[i];
          const gerente = gerentesData[i];

          return {
            cpf: cliente.cpf,
            nome: cliente.nome,
            email: cliente.email,
            endereco: cliente.endereco,
            cidade: cliente.cidade,
            estado: cliente.estado,
            salario: cliente.salario ?? null,
            conta: String(conta.numConta),
            saldo: conta.saldo,
            limite: conta.limite,
            gerente: gerente.cpf,
            gerente_nome: gerente.nome,
            gerente_email: gerente.email,
          };
        });

        return res.status(200).json(final);
      } catch (err) {
        console.error(
          "Erro composition /clientes?filtro=adm_relatorio_clientes",
          err
        );
        if (err && err.remote) return propagateRemoteError(res, err.remote);
        return res
          .status(500)
          .json({ mensagem: "Erro interno no API Gateway" });
      }
    }

    if (filtro === "melhores_clientes") {
      try {
        const contasResp = await axiosInstance.get(`${CONTA}/contas/melhoresClientes`);
        if (contasResp.status >= 400)
          return propagateRemoteError(res, contasResp);

        const contas = contasResp.data || [];

        const clientesResp = await Promise.all(
          contas.map((c) =>
            axiosInstance.get(`${CLIENTE}/clientes/${c.cpfCliente}`)
          )
        );

        const clientes = clientesResp.map((r) => r.data);

        const gerentesResp = await Promise.all(
          contas.map((c) =>
            axiosInstance.get(`${GERENTE}/gerentes/${c.cpfGerente}`)
          )
        );
        const gerentes = gerentesResp.map((r) => r.data);

        const final = clientes.map((cliente, i) => ({
          cpf: cliente.cpf,
          nome: cliente.nome,
          email: cliente.email,
          endereco: cliente.endereco,
          cidade: cliente.cidade,
          estado: cliente.estado,
          salario: cliente.salario ?? null,
          conta: String(contas[i].numConta),
          saldo: contas[i].saldo,
          limite: contas[i].limite,
          gerente: gerentes[i].cpf,
          gerente_nome: gerentes[i].nome,
          gerente_email: gerentes[i].email,
        }));

        return res.status(200).json(final);
      } catch (err) {
        console.error(
          "Erro composition /clientes?filtro=melhores_clientes",
          err
        );
        if (err && err.remote) return propagateRemoteError(res, err.remote);
        return res
          .status(500)
          .json({ mensagem: "Erro interno no API Gateway" });
      }
    }

    return createProxyMiddleware({
      target: CLIENTE,
      changeOrigin: true,
    })(req, res, next);
  }
);

module.exports = router;

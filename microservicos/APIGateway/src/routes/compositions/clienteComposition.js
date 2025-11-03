// clienteComposition.js
const express = require("express");
const { axiosInstance, propagateRemoteError } = require("./shared");
// const { verifyJWT } = require('../../middlewares/verifyJWT'); // ready but disabled

const router = express.Router();

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn(
    "Composition (cliente): alguma SERVICE_URL não está definida (CLIENTE/CONTA/GERENTE)."
  );
}

/**
 * Helper: obter conta por cpf, propaga erro se necessário.
 */
async function fetchContaByCpf(cpf) {
  const url = `${CONTA}/contas/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

/**
 * Helper: obter gerente por cpf
 */
async function fetchGerenteByCpf(cpf) {
  const url = `${GERENTE}/gerentes/${encodeURIComponent(cpf)}`;
  const resp = await axiosInstance.get(url);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

/**
 * GET /clientes/:cpf
 * Composition: ms-clientes -> ms-conta -> ms-gerente
 * - Remove 'cep' do cliente final (seguindo Swagger)
 * - Se qualquer serviço retornar erro >=400 -> propaga (opção B)
 */
router.get(
  "/clientes/:cpf",
  /* verifyJWT, */ async (req, res) => {
    const { cpf } = req.params;

    try {
      // 1) ms-clientes
      const clienteUrl = `${CLIENTE}/clientes/${encodeURIComponent(cpf)}`;
      const clienteResp = await axiosInstance.get(clienteUrl);
      if (clienteResp.status >= 400)
        return propagateRemoteError(res, clienteResp);

      const cliente = clienteResp.data;
      // remove cep intentionally (swagger doesn't include it)
      // 2) ms-conta
      let conta;
      try {
        conta = await fetchContaByCpf(cpf);
      } catch (e) {
        return propagateRemoteError(res, e.remote);
      }

      // 3) ms-gerente -> use cpfGerente from conta
      const cpfGerente = conta.cpfGerente || conta.cpfGerente;
      if (!cpfGerente) {
        // se não vier cpfGerente, considerar 404 conforme regra B
        return res.status(404).end();
      }

      let gerente;
      try {
        gerente = await fetchGerenteByCpf(cpfGerente);
      } catch (e) {
        return propagateRemoteError(res, e.remote);
      }

      // Monta resposta exatamente conforme Swagger (sem 'cep'), na ordem desejada
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
      // if thrown remote error earlier handled, else generic 500
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res
        .status(500)
        .json({ cod: 500, mensagem: "Erro interno no API Gateway" });
    }
  }
);

/**
 * GET /clientes  with filtro=adm_relatorio_clientes
 * Behavior:
 * - calls ms-clientes?filtro=adm_relatorio_clientes
 * - for each cliente, fetch conta (/contas/{cpf}) -> if any error propagate
 * - for each conta, fetch gerente (/gerentes/{cpfGerente}) -> if error propagate
 * - compose array of objects like in the Swagger (cliente + conta + gerente fields)
 *
 * Note: this may produce many requests; we run them with Promise.all per batch.
 */
router.get(
  "/clientes",
  /* verifyJWT, */ async (req, res) => {
    const filtro = req.query.filtro;

    // If not the special filter, let proxies handle it (so composition only for adm_relatorio_clientes)
    if (!filtro || filtro !== "adm_relatorio_clientes") {
      return res.status(204).end(); // signal: not handled by composition (index.js will let proxies run)
    }

    try {
      // 1) obter clientes com filtro
      const clientesUrl = `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`;
      const clientesResp = await axiosInstance.get(clientesUrl);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];

      // 2) Para cada cliente, buscar conta (em paralelo)
      const contasPromises = clientes.map((c) =>
        axiosInstance.get(`${CONTA}/contas/${encodeURIComponent(c.cpf)}`)
      );
      const contasResponses = await Promise.all(contasPromises);

      // Verificar erros em contas
      for (const cr of contasResponses) {
        if (cr.status >= 400) return propagateRemoteError(res, cr);
      }

      // 3) Para cada conta, buscar gerente (em paralelo)
      const contasData = contasResponses.map((r) => r.data);
      const gerentesPromises = contasData.map((conta) =>
        axiosInstance.get(
          `${GERENTE}/gerentes/${encodeURIComponent(conta.cpfGerente)}`
        )
      );
      const gerentesResponses = await Promise.all(gerentesPromises);

      for (const gr of gerentesResponses) {
        if (gr.status >= 400) return propagateRemoteError(res, gr);
      }

      const gerentesData = gerentesResponses.map((r) => r.data);

      // 4) construir array final: para cada cliente combinar cliente + conta + gerente
      // Preservando campos conforme Swagger
      const final = clientes.map((cliente, idx) => {
        const conta = contasData[idx];
        const gerente = gerentesData[idx];

        return {
          cpf: cliente.cpf,
          nome: cliente.nome,
          email: cliente.email,
          endereco: cliente.endereco,
          cidade: cliente.cidade,
          estado: cliente.estado,
          salario: cliente.salario ?? null, // cliente list may not include salario; keep null if not present
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
        "Erro composition GET /clientes?filtro=adm_relatorio_clientes",
        err
      );
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res
        .status(500)
        .json({ cod: 500, mensagem: "Erro interno no API Gateway" });
    }
  }
);

module.exports = router;

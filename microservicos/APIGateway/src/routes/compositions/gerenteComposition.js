// gerenteComposition.js
const express = require("express");
const { axiosInstance, propagateRemoteError } = require("./shared");
// const { verifyJWT, requireRoles } = require('../../middlewares/verifyJWT'); // ready but disabled

const router = express.Router();

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn(
    "Composition (gerente): alguma SERVICE_URL não está definida (CLIENTE/CONTA/GERENTE)."
  );
}

/**
 * GET /gerentes?numero=dashboard
 * Composition:
 *  - GET ms-gerente /gerentes
 *  - GET ms-clientes?filtro=adm_relatorio_clientes
 *  - GET ms-conta /contas/{cpf} for each client
 *  - group clientes by cpfGerente, build the dashboard objects
 *
 * If query.numero !== 'dashboard' -> return 204 to signal NOT HANDLED (proxies will handle)
 */
router.get(
  "/gerentes",
  /* verifyJWT, requireRoles(['ADMINISTRADOR']), */ async (req, res) => {
    const numero = req.query.numero;

    if (!numero || numero !== "dashboard") {
      // not our concern here; proxies will handle the generic GET /gerentes
      return res.status(204).end();
    }

    try {
      // 1) get all gerentes
      const gerentesResp = await axiosInstance.get(`${GERENTE}/gerentes`);
      if (gerentesResp.status >= 400)
        return propagateRemoteError(res, gerentesResp);
      const gerentes = gerentesResp.data || [];

      // 2) get clientes com filtro adm_relatorio_clientes
      const clientesResp = await axiosInstance.get(
        `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`
      );
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);
      const clientes = clientesResp.data || [];

      // 3) for each cliente fetch their conta
      const contasPromises = clientes.map((c) =>
        axiosInstance.get(`${CONTA}/contas/${encodeURIComponent(c.cpf)}`)
      );
      const contasResponses = await Promise.all(contasPromises);

      for (const cr of contasResponses) {
        if (cr.status >= 400) return propagateRemoteError(res, cr);
      }

      const contas = contasResponses.map((r) => r.data);

      // 4) group contas by cpfGerente
      const agrupamento = {}; // cpfGerente => array de contas
      contas.forEach((conta) => {
        const cpfG = conta.cpfGerente;
        if (!agrupamento[cpfG]) agrupamento[cpfG] = [];
        agrupamento[cpfG].push(conta);
      });

      // 5) montar array final seguindo swagger
      const final = gerentes.map((gerente) => {
        const contasDoGerente = agrupamento[gerente.cpf] || [];

        // montar clientes[] com os campos esperados
        const clientesDoGerente = contasDoGerente.map((ct) => ({
          cliente: ct.cpfCliente,
          numero: String(ct.numConta),
          saldo: ct.saldo,
          limite: ct.limite,
          gerente: ct.cpfGerente,
          criacao: ct.dataCriacao,
        }));

        // calcular saldo_positivo e saldo_negativo
        let saldoPositivo = 0;
        let saldoNegativo = 0;
        contasDoGerente.forEach((ct) => {
          const s = Number(ct.saldo) || 0;
          if (s >= 0) saldoPositivo += s;
          else saldoNegativo += s;
        });

        return {
          gerente: {
            cpf: gerente.cpf,
            nome: gerente.nome,
            email: gerente.email,
            tipo: gerente.tipo,
          },
          clientes: clientesDoGerente,
          saldo_positivo: Number(saldoPositivo.toFixed(2)),
          saldo_negativo: Number(saldoNegativo.toFixed(2)),
        };
      });

      return res.status(200).json(final);
    } catch (err) {
      console.error("Erro composition GET /gerentes?numero=dashboard", err);
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res
        .status(500)
        .json({ cod: 500, mensagem: "Erro interno no API Gateway" });
    }
  }
);

module.exports = router;

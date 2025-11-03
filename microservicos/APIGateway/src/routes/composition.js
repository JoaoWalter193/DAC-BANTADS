const express = require("express");
const axios = require("axios");
const { verifyJWT } = require("../middlewares/verifyJWT");

const router = express.Router();

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn(
    "Composition: alguma SERVICE_URL não está definida nas variáveis de ambiente."
  );
}

router.get(
  "/clientes/:cpf",
  /* verifyJWT, */ async (req, res) => {
    const { cpf } = req.params;

    try {
      const clienteUrl = `${CLIENTE}/clientes/${encodeURIComponent(cpf)}`;
      const clienteResp = await axios.get(clienteUrl, { validadeStatus: null });

      if (clienteResp.status === 404) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      if (clienteResp.status >= 404) {
        return res.status(500).json({ message: "Erro no ms-cliente" });
      }

      const cliente = clienteResp.data;

      const contaUrl = `${CONTA}/contas/${encodeURIComponent(cpf)}`;
      const contaResp = await axios.get(contaUrl, { validadeStatus: null });

      if (contaResp.status === 404) {
        return res
          .status(404)
          .json({ message: "Conta não encontrada para o cliente" });
      }

      if (contaResp.status >= 404) {
        return res.status(500).json({ message: "Erro no ms-conta" });
      }

      const conta = contaResp.data;

      const cpfGerente = conta.cpfGerente || conta.cpfGerente;
      if (!cpfGerente) {
        return res
          .status(404)
          .json({ message: "Gerente não encontrado para a conta" });
      }

      const gerenteUrl = `${GERENTE}/gerentes/${encodeURIComponent(
        cpfGerente
      )}`;
      const gerenteResp = await axios.get(gerenteUrl, { validadeStatus: null });

      if (gerenteResp.status === 404) {
        return res.status(404).json({ message: "Gerente não encontrado" });
      }

      if (gerenteResp.status >= 404) {
        return res.status(500).json({ message: "Erro no ms-gerente" });
      }

      const gerente = gerenteResp.data;

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
      console.error("Erro composition /clientes/:cpf", err?.message || err);

      const remoteStatus = err?.response?.status;
      const remoteData = err?.response?.data;

      if (remoteStatus) {
        return res
          .status(remoteStatus)
          .json(remoteData || { error: "Erro em microsserviço externo" });
      }

      return res.status(500).json({ message: "Erro interno no API Gateway" });
    }
  }
);

module.exports = router;

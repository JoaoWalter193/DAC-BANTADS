const { axiosInstance, propagateRemoteError } = require("./shared");
const { createProxyMiddleware } = require("http-proxy-middleware");

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn(
    "⚠️ Composition (gerente): alguma SERVICE_URL não está definida."
  );
}

// Middleware para GET /gerentes
const getGerentes = async (req, res, next) => {
  const { filtro } = req.query;
  console.log("🔍 GET /gerentes - Filtro:", filtro);

  if (filtro !== "dashboard") {
    console.log("🔍 Usando proxy direto para GERENTE service");
    return createProxyMiddleware({
      target: GERENTE,
      changeOrigin: true,
    })(req, res, next);
  }

  try {
    console.log("🔍 Processando composition para dashboard");

    const gerentesResp = await axiosInstance.get(`${GERENTE}/gerentes`);
    if (gerentesResp.status >= 400)
      return propagateRemoteError(res, gerentesResp);

    const gerentes = gerentesResp.data || [];
    console.log("🔍 Gerentes encontrados:", gerentes.length);

    const clientesResp = await axiosInstance.get(
      `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`
    );
    if (clientesResp.status >= 400)
      return propagateRemoteError(res, clientesResp);

    const clientes = clientesResp.data || [];
    console.log("🔍 Clientes encontrados:", clientes.length);

    const contasResponses = await Promise.all(
      clientes.map((c) =>
        axiosInstance.get(`${CONTA}/contas/${encodeURIComponent(c.cpf)}`)
      )
    );

    for (const r of contasResponses) {
      if (r.status >= 400) return propagateRemoteError(res, r);
    }

    const contas = contasResponses.map((r) => r.data);
    console.log("🔍 Contas encontradas:", contas.length);

    const contasPorGerente = {};
    contas.forEach((conta) => {
      const cpfGerente = conta.cpfGerente;
      if (!contasPorGerente[cpfGerente]) contasPorGerente[cpfGerente] = [];
      contasPorGerente[cpfGerente].push(conta);
    });

    const final = gerentes.map((gerente) => {
      const contasDoGerente = contasPorGerente[gerente.cpf] || [];

      const clientesDoGerente = contasDoGerente.map((c) => ({
        cliente: c.cpfCliente,
        numero: String(c.numConta),
        saldo: c.saldo,
        limite: c.limite,
        gerente: c.cpfGerente,
        criacao: c.dataCriacao,
      }));

      let saldoPositivo = 0;
      let saldoNegativo = 0;

      contasDoGerente.forEach((c) => {
        const s = Number(c.saldo) || 0;
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

    console.log("✅ Dashboard gerado com sucesso");
    return res.status(200).json(final);
  } catch (err) {
    console.error("❌ Erro composition GET /gerentes?filtro=dashboard", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

module.exports = getGerentes;

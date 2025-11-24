const { axiosInstance, propagateRemoteError } = require("./shared");
const { createProxyMiddleware } = require("http-proxy-middleware");

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn("Composition (gerente): alguma SERVICE_URL não está definida.");
}

const GERENTES_LIST_PATH = "gerentes/lista";

const getGerentes = async (req, res, next) => {
  const { filtro } = req.query;
  console.log("🔍 GET /gerentes - Filtro:", filtro);

  if (filtro !== "dashboard" && filtro !== "adm_relatorio_clientes") {
    console.log("🔍 Usando proxy direto para GERENTE service");

    console.log(`[LOG PROXY] Destino (Target): ${GERENTE}`);
    console.log(
      `[LOG PROXY] Reescrita (Rewrite): ^/gerentes$ -> ${GERENTES_LIST_PATH}`
    );

    return createProxyMiddleware({
      target: GERENTE,
      changeOrigin: true,
      pathRewrite: {
        "^/gerentes$": GERENTES_LIST_PATH,
      },
    })(req, res, next);
  }

  try {
    if (filtro === "adm_relatorio_clientes") {
      console.log(
        "🔍 Processando composition para Relatório de Clientes (R16)"
      );

      const gerentesResp = await axiosInstance.get(
        `${GERENTE}${GERENTES_LIST_PATH}`
      );
      if (gerentesResp.status >= 400)
        return propagateRemoteError(res, gerentesResp);

      const gerentes = gerentesResp.data || [];
      const gerentesMap = new Map(gerentes.map((g) => [g.cpf, g]));

      const clientesResp = await axiosInstance.get(`${CLIENTE}clientes`);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];
      console.log("🔍 Clientes encontrados:", clientes.length);

      const contasResponses = await Promise.all(
        clientes.map((c) =>
          axiosInstance
            .get(`${CONTA}contas/${encodeURIComponent(c.cpf)}`)
            .catch((error) => {
              if (error.response && error.response.status === 404)
                return error.response;
              if (error.response) return error.response;
              throw error;
            })
        )
      );

      const relatorioFinal = [];

      for (let i = 0; i < clientes.length; i++) {
        const cliente = clientes[i];
        const contaResp = contasResponses[i];

        let conta = null;
        let gerenteData = {};

        if (contaResp.status === 200) {
          conta = contaResp.data;
          const gerente = gerentesMap.get(conta.cpfGerente);

          if (gerente) {
            gerenteData = {
              gerente: gerente.cpf,
              gerente_nome: gerente.nome,
              gerente_email: gerente.email,
            };
          }
        }

        relatorioFinal.push({
          cpf: cliente.cpf,
          nome: cliente.nome,
          email: cliente.email,
          salario: cliente.salario,
          endereco: cliente.endereco,
          cidade: cliente.cidade,
          estado: cliente.estado,
          conta: conta ? conta.numConta : "",
          saldo: conta ? conta.saldo : 0,
          limite: conta ? conta.limite : 0,
          ...gerenteData,
        });
      }

      relatorioFinal.sort((a, b) => a.nome.localeCompare(b.nome));

      console.log("✅ Relatório de clientes composto e ordenado com sucesso.");
      return res.status(200).json(relatorioFinal);
    }

    if (filtro === "dashboard") {
      console.log("🔍 Processando composition para dashboard");

      const gerentesResp = await axiosInstance.get(
        `${GERENTE}${GERENTES_LIST_PATH}`
      );
      if (gerentesResp.status >= 400)
        return propagateRemoteError(res, gerentesResp);

      const gerentes = gerentesResp.data || [];
      console.log("🔍 Gerentes encontrados:", gerentes.length);

      const clientesResp = await axiosInstance.get(`${CLIENTE}clientes`);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];
      console.log("🔍 Clientes encontrados:", clientes.length);

      const contasResponses = await Promise.all(
        clientes.map((c) =>
          axiosInstance
            .get(`${CONTA}contas/${encodeURIComponent(c.cpf)}`)
            .catch((error) => {
              if (error.response) return error.response;
              throw error;
            })
        )
      );

      for (const r of contasResponses) {
        if (r.status >= 500 || (r.status >= 400 && r.status !== 404)) {
          console.error(
            `Erro inesperado na busca de conta. Status: ${r.status}`
          );
          return propagateRemoteError(res, r);
        }
      }

      const contas = contasResponses
        .filter((r) => r.status === 200)
        .map((r) => r.data);
      console.log("Contas encontradas:", contas.length);

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

      final.sort((a, b) => b.saldo_positivo - a.saldo_positivo);

      console.log("✅ Dashboard gerado com sucesso");
      return res.status(200).json(final);
    }
  } catch (err) {
    console.error("Erro composition GET /gerentes", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

const getClientesDoGerente = async (req, res, next) => {
  const { cpfGerente } = req.params;
  const { busca } = req.query;

  console.log("GET /gerentes/:cpfGerente/clientes - CPF Gerente:", cpfGerente);
  console.log("Parâmetro de busca:", busca);

  try {
    const gerenteResp = await axiosInstance.get(
      `${GERENTE}gerentes/${cpfGerente}`
    );
    if (gerenteResp.status >= 400)
      return propagateRemoteError(res, gerenteResp);

    const gerente = gerenteResp.data;
    console.log("Gerente encontrado:", gerente.nome);

    const clientesResp = await axiosInstance.get(`${CLIENTE}clientes`);
    if (clientesResp.status >= 400)
      return propagateRemoteError(res, clientesResp);

    const clientes = clientesResp.data || [];
    console.log("Total de clientes encontrados:", clientes.length);

    const contasResponses = await Promise.all(
      clientes.map((c) =>
        axiosInstance.get(`${CONTA}contas/${encodeURIComponent(c.cpf)}`)
      )
    );

    const clientesDoGerente = [];

    for (let i = 0; i < clientes.length; i++) {
      const contaResp = contasResponses[i];
      if (contaResp.status === 200) {
        const conta = contaResp.data;

        if (conta.cpfGerente === cpfGerente) {
          const cliente = clientes[i];
          clientesDoGerente.push({
            cpf: cliente.cpf,
            nome: cliente.nome,
            cidade: cliente.cidade,
            estado: cliente.estado,
            saldo: conta.saldo,
            limite: conta.limite,
            email: cliente.email,
            endereco: cliente.endereco,
            salario: cliente.salario,
            numeroConta: conta.numConta,
            gerente_nome: gerente.nome,
            gerente_email: gerente.email,
          });
        }
      }
    }

    console.log("Clientes do gerente encontrados:", clientesDoGerente.length);

    let clientesFiltrados = clientesDoGerente;
    if (busca && busca.trim() !== "") {
      const termoBusca = busca.toLowerCase().trim();
      clientesFiltrados = clientesDoGerente.filter(
        (cliente) =>
          cliente.cpf.toLowerCase().includes(termoBusca) ||
          cliente.nome.toLowerCase().includes(termoBusca)
      );
      console.log("Clientes após filtro:", clientesFiltrados.length);
    }

    clientesFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));

    const resposta = clientesFiltrados.map((cliente) => ({
      cpf: cliente.cpf,
      nome: cliente.nome,
      cidade: cliente.cidade,
      estado: cliente.estado,
      saldo: cliente.saldo,
      limite: cliente.limite,
      link_detalhes: `/clientes/${cliente.cpf}`,
    }));

    console.log("Lista de clientes do gerente gerada com sucesso");
    return res.status(200).json(resposta);
  } catch (err) {
    console.error("Erro em GET /gerentes/:cpfGerente/clientes:", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

module.exports = { getGerentes, getClientesDoGerente };

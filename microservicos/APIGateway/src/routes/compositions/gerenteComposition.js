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

// Caminho de listagem dos gerentes no microserviço
const GERENTES_LIST_PATH = "/gerentes/lista";

// Middleware para GET /gerentes
const getGerentes = async (req, res, next) => {
  const { filtro } = req.query;
  console.log("🔍 GET /gerentes - Filtro:", filtro);

  // A requisição R16 é uma exceção ao proxy e deve ser tratada como composition
  if (filtro !== "dashboard" && filtro !== "adm_relatorio_clientes") {
    console.log("🔍 Usando proxy direto para GERENTE service");
    return createProxyMiddleware({
      target: GERENTE,
      changeOrigin: true,
      pathRewrite: {
        "^/gerentes$": GERENTES_LIST_PATH,
      },
    })(req, res, next);
  }

  try {
    
    // =========================================================================
    // NOVO BLOCO: COMPOSITION PARA RELATÓRIO DE CLIENTES (R16)
    // Este bloco garante que todos os dados sejam agregados antes de retornar.
    // =========================================================================
    if (filtro === "adm_relatorio_clientes") {
      console.log("🔍 Processando composition para Relatório de Clientes (R16)");

      // 1. Buscar todos os gerentes para mapeamento rápido
      const gerentesResp = await axiosInstance.get(
        `${GERENTE}${GERENTES_LIST_PATH}`
      );
      if (gerentesResp.status >= 400) return propagateRemoteError(res, gerentesResp);

      const gerentes = gerentesResp.data || [];
      // Mapeia gerentes por CPF para lookup instantâneo
      const gerentesMap = new Map(gerentes.map(g => [g.cpf, g])); 

      // 2. Buscar todos os clientes (usando o endpoint básico do Cliente)
      const clientesResp = await axiosInstance.get(`${CLIENTE}/clientes`); 
      if (clientesResp.status >= 400) return propagateRemoteError(res, clientesResp);
      
      const clientes = clientesResp.data || [];
      console.log("🔍 Clientes encontrados:", clientes.length);

      // 3. Buscar todas as contas concorrentemente
      const contasResponses = await Promise.all(
        clientes.map((c) =>
          axiosInstance
            .get(`${CONTA}/contas/${encodeURIComponent(c.cpf)}`)
            .catch((error) => {
              // Trata o erro 404 (conta não encontrada) como esperado, retornando o objeto de resposta
              if (error.response && error.response.status === 404) return error.response;
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
              gerente: gerente.cpf, // CPF do Gerente
              gerente_nome: gerente.nome, // Nome do Gerente
              gerente_email: gerente.email, // Email do Gerente
            };
          }
        }

        // 4. Composição da ClienteRelatorioDTO completa
        relatorioFinal.push({
          cpf: cliente.cpf,
          nome: cliente.nome,
          email: cliente.email,
          salario: cliente.salario,
          endereco: cliente.endereco,
          cidade: cliente.cidade,
          estado: cliente.estado,
          // Dados da Conta (usando valores padrão se a conta não for encontrada)
          conta: conta ? conta.numConta : '',
          saldo: conta ? conta.saldo : 0,
          limite: conta ? conta.limite : 0,
          ...gerenteData,
        });
      }

      // 5. Ordenação crescente por nome do cliente (conforme R16)
      relatorioFinal.sort((a, b) => a.nome.localeCompare(b.nome));

      console.log("✅ Relatório de clientes composto e ordenado com sucesso.");
      return res.status(200).json(relatorioFinal);

    } 
    // =========================================================================
    // FIM R16 BLOCK
    // =========================================================================

    if (filtro === "dashboard") {
      console.log("🔍 Processando composition para dashboard");

      const gerentesResp = await axiosInstance.get(
        `${GERENTE}${GERENTES_LIST_PATH}`
      );
      if (gerentesResp.status >= 400)
        return propagateRemoteError(res, gerentesResp);

      const gerentes = gerentesResp.data || [];
      console.log("🔍 Gerentes encontrados:", gerentes.length);

      // CORREÇÃO: Usar o endpoint básico '/clientes' para evitar o bug de filtro
      // Se este endpoint não retornar a lista básica, use um filtro específico para lista simples.
      const clientesResp = await axiosInstance.get(`${CLIENTE}/clientes`);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];
      console.log("🔍 Clientes encontrados:", clientes.length);

      // A partir daqui, a lógica do dashboard continua a mesma, agregando contas
      // e gerando os saldos positivo/negativo.

      const contasResponses = await Promise.all(
        clientes.map((c) =>
          axiosInstance
            .get(`${CONTA}/contas/${encodeURIComponent(c.cpf)}`)
            .catch((error) => {
              // Se o erro tiver uma resposta HTTP (ex: 404), retornamos o objeto de resposta.
              // Se for um erro de rede/timeout, re-lançamos.
              if (error.response) return error.response;
              throw error;
            })
        )
      );

      for (const r of contasResponses) {
        // Propagamos erros apenas se for um erro interno do servidor (>= 500)
        if (r.status >= 500 || (r.status >= 400 && r.status !== 404)) {
          console.error(
            `❌ Erro inesperado na busca de conta. Status: ${r.status}`
          );
          return propagateRemoteError(res, r);
        }
      }

      const contas = contasResponses
        .filter((r) => r.status === 200)
        .map((r) => r.data);
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

      // FIX 3: Adiciona a ordenação por saldo positivo (R15)
      final.sort((a, b) => b.saldo_positivo - a.saldo_positivo);

      console.log("✅ Dashboard gerado com sucesso");
      return res.status(200).json(final);
    } // Fim do bloco dashboard
    
  } catch (err) {
    console.error("❌ Erro composition GET /gerentes", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

// O restante do código (getClientesDoGerente) permanece igual...
const getClientesDoGerente = async (req, res, next) => {
  // ... (função inalterada) ...
  const { cpfGerente } = req.params;
  const { busca } = req.query;

  console.log(
    "🔍 GET /gerentes/:cpfGerente/clientes - CPF Gerente:",
    cpfGerente
  );
  console.log("🔍 Parâmetro de busca:", busca);

  try {
    const gerenteResp = await axiosInstance.get(
      `${GERENTE}/gerentes/${cpfGerente}`
    );
    if (gerenteResp.status >= 400)
      return propagateRemoteError(res, gerenteResp);

    const gerente = gerenteResp.data;
    console.log("🔍 Gerente encontrado:", gerente.nome);

    const clientesResp = await axiosInstance.get(`${CLIENTE}/clientes`);
    if (clientesResp.status >= 400)
      return propagateRemoteError(res, clientesResp);

    const clientes = clientesResp.data || [];
    console.log("🔍 Total de clientes encontrados:", clientes.length);

    const contasResponses = await Promise.all(
      clientes.map((c) =>
        axiosInstance.get(`${CONTA}/contas/${encodeURIComponent(c.cpf)}`)
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

    console.log(
      "🔍 Clientes do gerente encontrados:",
      clientesDoGerente.length
    );

    let clientesFiltrados = clientesDoGerente;
    if (busca && busca.trim() !== "") {
      const termoBusca = busca.toLowerCase().trim();
      clientesFiltrados = clientesDoGerente.filter(
        (cliente) =>
          cliente.cpf.toLowerCase().includes(termoBusca) ||
          cliente.nome.toLowerCase().includes(termoBusca)
      );
      console.log("🔍 Clientes após filtro:", clientesFiltrados.length);
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

    console.log("✅ Lista de clientes do gerente gerada com sucesso");
    return res.status(200).json(resposta);
  } catch (err) {
    console.error("❌ Erro em GET /gerentes/:cpfGerente/clientes:", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

module.exports = { getGerentes, getClientesDoGerente };
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
      pathRewrite: (path, req) => {
        const newPath = path.split("?")[0];
        console.log("🔍 Path rewrite:", path, "->", newPath);
        return newPath;
      },
      onError: (err, req, res) => {
        console.error("❌ Erro no proxy para serviço de gerente:", err);
        res.status(502).json({
          mensagem: "Serviço de gerentes indisponível",
          detalhes: err.message,
        });
      },
    })(req, res, next);
  }

  try {
    console.log("🔍 Processando composition para dashboard");

    const gerentesResp = await axiosInstance.get(`${GERENTE}/gerentes`);
    if (gerentesResp.status >= 400) {
      console.error("❌ Erro ao buscar gerentes:", gerentesResp.status);
      return propagateRemoteError(res, gerentesResp);
    }

    const gerentes = gerentesResp.data || []; // ✅ MOVER para ANTES do uso
    console.log("🔍 Gerentes encontrados:", gerentes.length);

    // ✅ AGORA podemos verificar o length
    if (gerentes.length === 0) {
      console.log("🔍 Nenhum gerente encontrado, retornando array vazio");
      return res.status(200).json([]);
    }

    const clientesResp = await axiosInstance.get(
      `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`
    );
    if (clientesResp.status >= 400) {
      return propagateRemoteError(res, clientesResp);
    }

    const clientes = clientesResp.data || [];
    console.log("🔍 Clientes encontrados:", clientes.length);

    // Se não há clientes, retornar gerentes sem clientes
    if (clientes.length === 0) {
      console.log(
        "🔍 Nenhum cliente encontrado, retornando gerentes sem clientes"
      );
      const final = gerentes.map((gerente) => ({
        gerente: {
          cpf: gerente.cpf,
          nome: gerente.nome,
          email: gerente.email,
          tipo: gerente.tipo,
        },
        clientes: [],
        saldo_positivo: 0,
        saldo_negativo: 0,
      }));
      return res.status(200).json(final);
    }

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

    // ✅ Ordenar por nome do gerente
    final.sort((a, b) => a.gerente.nome.localeCompare(b.gerente.nome));

    console.log("✅ Dashboard gerado com sucesso");
    return res.status(200).json(final);
  } catch (err) {
    console.error("❌ Erro composition GET /gerentes?filtro=dashboard", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

// O restante do código (getClientesDoGerente) permanece igual...
const getClientesDoGerente = async (req, res, next) => {
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

const { createProxyMiddleware } = require("http-proxy-middleware");
const { axiosInstance, propagateRemoteError } = require("./shared");

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

async function fetchCliente(cpf) {
  const url = `${CLIENTE}/clientes/${encodeURIComponent(cpf)}`;
  console.log("🔍 Fetching cliente from:", url);
  const resp = await axiosInstance.get(url);
  console.log("🔍 Cliente response status:", resp.status);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

async function fetchConta(cpf) {
  const url = `${CONTA}/contas/${encodeURIComponent(cpf)}`;
  console.log("🔍 Fetching conta from:", url);
  const resp = await axiosInstance.get(url);
  console.log("🔍 Conta response status:", resp.status);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

async function fetchGerente(cpf) {
  const url = `${GERENTE}/gerentes/${encodeURIComponent(cpf)}`;
  console.log("🔍 Fetching gerente from:", url);
  const resp = await axiosInstance.get(url);
  console.log("🔍 Gerente response status:", resp.status);
  if (resp.status >= 400) throw { remote: resp };
  return resp.data;
}

const getClienteByCpf = async (req, res) => {
  const { cpf } = req.params;
  console.log("🔍 GET /clientes/:cpf - CPF:", cpf);

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
    console.error("❌ Erro em getClienteByCpf:", err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

// Middleware principal para GET /clientes
const getClientes = async (req, res, next) => {
  console.log("🔍 GET /clientes - Query params:", req.query);
  console.log("🔍 GET /clientes - User role:", req.user?.role);

  const { filtro } = req.query;
  console.log("🔍 Filtro recebido:", filtro);

  // Verificações de role já foram feitas no proxies.js, então só processamos

  if (filtro === "adm_relatorio_clientes") {
    try {
      const clientesUrl = `${CLIENTE}/clientes?filtro=adm_relatorio_clientes`;
      console.log("🔍 Fetching clientes from:", clientesUrl);
      const clientesResp = await axiosInstance.get(clientesUrl);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];
      console.log("🔍 Clientes encontrados:", clientes.length);

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
      console.error("❌ Erro em adm_relatorio_clientes:", err);
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (filtro === "melhores_clientes") {
    try {
      console.log("🔍 Fetching melhores clientes from CONTA service");
      const contasResp = await axiosInstance.get(
        `${CONTA}/contas/melhoresClientes`
      );
      if (contasResp.status >= 400)
        return propagateRemoteError(res, contasResp);

      const contas = contasResp.data || [];
      console.log("🔍 Melhores contas encontradas:", contas.length);

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
      console.error("❌ Erro em melhores_clientes:", err);
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (!filtro) {
    try {
      console.log("🔍 Fetching todos os clientes");
      const allClientesResp = await axiosInstance.get(`${CLIENTE}/clientes`);
      if (allClientesResp.status >= 400)
        return propagateRemoteError(res, allClientesResp);

      const clientes = allClientesResp.data || [];
      console.log("🔍 Todos os clientes encontrados:", clientes.length);

      const clientesComConta = [];

      for (const c of clientes) {
        try {
          await fetchConta(c.cpf);
          clientesComConta.push(c);
        } catch (_) {
          console.log(`🔍 Cliente ${c.cpf} sem conta, ignorando`);
        }
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

      console.log("🔍 Clientes com conta:", final.length);
      return res.status(200).json(final);
    } catch (err) {
      console.error("❌ Erro em lista sem filtro:", err);
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (filtro === "para_aprovar") {
    console.log("🔍 Usando proxy direto para CLIENTE service");
    return createProxyMiddleware({
      target: CLIENTE,
      changeOrigin: true,
    })(req, res, next);
  }

  // Fallback para outros filtros
  console.log("🔍 Usando proxy direto para filtro desconhecido:", filtro);
  return createProxyMiddleware({
    target: CLIENTE,
    changeOrigin: true,
  })(req, res, next);
};

module.exports = {
  getClienteByCpf,
  getClientes,
};

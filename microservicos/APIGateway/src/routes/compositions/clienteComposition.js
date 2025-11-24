const { createProxyMiddleware } = require("http-proxy-middleware");
const { axiosInstance, propagateRemoteError } = require("./shared");

const CLIENTE = process.env.CLIENTE_SERVICE_URL;
const CONTA = process.env.CONTA_SERVICE_URL;
const GERENTE = process.env.GERENTE_SERVICE_URL;

if (!CLIENTE || !CONTA || !GERENTE) {
  console.warn("Composition (cliente): alguma SERVICE_URL não está definida.");
}

const getClienteByCpf = async (req, res) => {
  const { cpf } = req.params;
  console.log("GET /clientes/:cpf - CPF:", cpf);

  try {
    const clienteResp = await axiosInstance.get(
      `${CLIENTE}clientes/${encodeURIComponent(cpf)}`
    );
    if (clienteResp.status !== 200)
      return propagateRemoteError(res, clienteResp);
    const cliente = clienteResp.data;

    let conta = null;
    try {
      const contaResp = await axiosInstance.get(
        `${CONTA}contas/${encodeURIComponent(cpf)}`
      );
      if (contaResp.status === 200) conta = contaResp.data;
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log(`Cliente ${cpf} sem conta.`);
      } else {
        throw e;
      }
    }

    let gerente = null;
    if (conta && conta.cpfGerente) {
      try {
        const gerenteResp = await axiosInstance.get(
          `${GERENTE}/gerentes/${encodeURIComponent(conta.cpfGerente)}`
        );
        if (gerenteResp.status === 200) gerente = gerenteResp.data;
      } catch (e) {
        if (e.response && e.response.status === 404) {
          console.warn(`Gerente CPF ${conta.cpfGerente} não encontrado.`);
        } else {
          throw e;
        }
      }
    }

    const limite = cliente ? cliente.salario / 2 : null;

    const finalData = {
      cpf: cliente.cpf,
      nome: cliente.nome,
      email: cliente.email,
      salario: cliente.salario,
      endereco: cliente.endereco,
      cep: cliente.cep,
      cidade: cliente.cidade,
      estado: cliente.estado,

      conta: conta?.numConta || null,
      saldo: conta?.saldo ?? 0,
      limite: limite ?? 0,

      gerente: conta?.cpfGerente || null,
      nome_gerente: gerente?.nome || "Não Atribuído",
      gerente_email: gerente?.email || null,
    };

    return res.status(200).json(finalData);
  } catch (err) {
    console.error(`Erro composition GET /clientes/${cpf}:`, err);
    if (err && err.remote) return propagateRemoteError(res, err.remote);
    return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
  }
};

const getClientes = async (req, res, next) => {
  console.log("GET /clientes - Query params:", req.query);
  console.log("GET /clientes - User role:", req.user?.role);

  const { filtro } = req.query;
  console.log("Filtro recebido:", filtro);

  if (filtro === "adm_relatorio_clientes") {
    console.log("Processando composition para Relatório de Clientes (R16)");
    try {
      const clientesUrl = `${CLIENTE}clientes?filtro=${filtro}`;
      console.log("Fetching clientes from:", clientesUrl);
      const clientesResp = await axiosInstance.get(clientesUrl);
      if (clientesResp.status >= 400)
        return propagateRemoteError(res, clientesResp);

      const clientes = clientesResp.data || [];

      if (clientes.length === 0) {
        console.log("Nenhum cliente encontrado, retornando lista vazia.");
        return res.status(200).json([]);
      }
      console.log(`Clientes base encontrados: ${clientes.length}`);

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

      const contasMap = new Map();
      const uniqueGerenteCpfs = new Set();

      for (const r of contasResponses) {
        if (r.status === 200) {
          const conta = r.data;
          contasMap.set(conta.cpfCliente, conta);
          if (conta.cpfGerente) {
            uniqueGerenteCpfs.add(conta.cpfGerente);
          }
        } else if (r.status >= 500 || (r.status >= 400 && r.status !== 404)) {
          console.error(`Erro crítico na busca de conta. Status: ${r.status}`);
          throw { remote: r };
        }
      }
      console.log(
        `Contas válidas encontradas: ${contasMap.size}. Gerentes únicos: ${uniqueGerenteCpfs.size}`
      );

      const gerenteCpfArray = Array.from(uniqueGerenteCpfs);
      const gerentesResponses = await Promise.all(
        gerenteCpfArray.map((cpf) =>
          axiosInstance
            .get(`${GERENTE}/gerentes/${encodeURIComponent(cpf)}`)
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                console.warn(`⚠️ Gerente CPF ${cpf} não encontrado (404).`);
                return {
                  status: 404,
                  data: { cpf: cpf, nome: "GERENTE NÃO ENCONTRADO" },
                };
              }
              throw error;
            })
        )
      );

      const gerentesMap = new Map();
      for (const r of gerentesResponses) {
        if (r.status === 200 || r.status === 404) {
          const gerente = r.data;
          gerentesMap.set(gerente.cpf, gerente);
        } else if (r.status >= 500) {
          throw { remote: r };
        }
      }

      const finalReport = clientes.map((cliente) => {
        const conta = contasMap.get(cliente.cpf);
        const cpfGerente = conta?.cpfGerente;
        const gerente = gerentesMap.get(cpfGerente);

        return {
          cpf: cliente.cpf,
          nome: cliente.nome,
          email: cliente.email,
          salario: cliente.salario,

          conta: conta?.numConta || null,
          saldo: conta?.saldo ?? 0,
          limite: conta?.limite ?? 0,

          gerente: cpfGerente || null,
          nome_gerente: gerente?.nome || "Não Atribuído",
        };
      });

      finalReport.sort((a, b) => a.nome.localeCompare(b.nome));

      console.log("Relatório de Clientes (R16) gerado com sucesso.");
      return res.status(200).json(finalReport);
    } catch (err) {
      console.error(
        "Erro composition GET /clientes?filtro=adm_relatorio_clientes",
        err
      );
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (filtro === "melhores_clientes") {
    try {
      console.log("Fetching melhores clientes from CONTA service");
      const contasResp = await axiosInstance.get(
        `${CONTA}contas/melhoresClientes`
      );
      if (contasResp.status >= 400)
        return propagateRemoteError(res, contasResp);

      const contas = contasResp.data || [];
      console.log("Melhores contas encontradas:", contas.length);

      const clientesResp = await Promise.all(
        contas.map((c) =>
          axiosInstance
            .get(`${CLIENTE}clientes/${encodeURIComponent(c.cpfCliente)}`)
            .catch((error) => {
              if (error.response) return error.response;
              throw error;
            })
        )
      );

      const final = clientesResp
        .filter((r) => r.status === 200)
        .map((clienteResp, index) => {
          const cliente = clienteResp.data;
          const conta = contas[index];
          return {
            cpf: cliente.cpf,
            nome: cliente.nome,
            email: cliente.email,
            salario: cliente.salario ?? null,
            endereco: cliente.endereco,
            cidade: cliente.cidade,
            estado: cliente.estado,
            saldo: conta.saldo,
          };
        });

      console.log("Melhores clientes processados:", final.length);
      return res.status(200).json(final);
    } catch (err) {
      console.error("Erro em melhores_clientes:", err);
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (!filtro) {
    try {
      console.log("Fetching todos os clientes");
      const allClientesResp = await axiosInstance.get(`${CLIENTE}clientes`);
      if (allClientesResp.status >= 400)
        return propagateRemoteError(res, allClientesResp);

      const clientes = allClientesResp.data || [];
      console.log("Todos os clientes encontrados:", clientes.length);

      const clientesComConta = [];

      for (const c of clientes) {
        try {
          await axiosInstance.get(
            `${CONTA}contas/${encodeURIComponent(c.cpf)}`
          );
          clientesComConta.push(c);
        } catch (e) {
          if (e.response && e.response.status === 404) {
            console.log(`Cliente ${c.cpf} sem conta, ignorando`);
          } else {
            throw e;
          }
        }
      }

      const final = clientesComConta
        .map((c) => ({
          cpf: c.cpf,
          nome: c.nome,
          email: c.email,
          salario: c.salario ?? null,
          endereco: c.endereco,
          cidade: c.cidade,
          estado: c.estado,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      console.log("Clientes com conta:", final.length);
      return res.status(200).json(final);
    } catch (err) {
      console.error("Erro em lista sem filtro:", err);
      if (err && err.remote) return propagateRemoteError(res, err.remote);
      return res.status(500).json({ mensagem: "Erro interno no API Gateway" });
    }
  }

  if (filtro === "para_aprovar") {
    console.log("Usando proxy direto para CLIENTE service");
    return createProxyMiddleware({
      target: CLIENTE,
      changeOrigin: true,
    })(req, res, next);
  }

  console.log("Usando proxy direto para filtro desconhecido:", filtro);
  return createProxyMiddleware({
    target: CLIENTE,
    changeOrigin: true,
  })(req, res, next);
};

module.exports = {
  getClienteByCpf,
  getClientes,
};

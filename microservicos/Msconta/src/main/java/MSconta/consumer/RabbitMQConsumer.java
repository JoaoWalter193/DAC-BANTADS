package MSconta.consumer;


import MSconta.domain.*;
import MSconta.domain.DTOCqrs.AtualizarDTO;
import MSconta.domain.DTOCqrs.SaqueDepositoDTO;
import MSconta.domain.DTOCqrs.TransferenciaDTO;
import MSconta.domain.movimentacoes.MovimentacoesR;
import MSconta.producer.RabbitMQProducer;
import MSconta.repositories.r.ContaRRepository;
import MSconta.repositories.r.MovimentacaoRRepository;
import MSconta.services.ContaCUDService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class RabbitMQConsumer {


    // usasdos para atualizar via CQRS
    @Autowired
    ContaRRepository contaRRepository;

    @Autowired
    ContaCUDService contaCUDService;

    @Autowired
    MovimentacaoRRepository movimentacaoRRepository;

// teste pedro alteracaoperfil
    @Autowired
    RabbitMQProducer rabbitMQProducer;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    private final ObjectMapper objectMapper;

    public RabbitMQConsumer() {
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }


    @RabbitListener(queues = {"MsConta"})
    public void consume(ResponseDTO message) {
        if (message.ms().equals("Criar conta")) {
            System.out.println("CHEGOU ATÉ AQUI PARA CRIAR A CONTA DO CARA");
            AdicionarContaDTO contaTemp = new AdicionarContaDTO(message.cpf(),
                    message.nome(),
                    message.salario());
            contaCUDService.adicionarConta(contaTemp);
        }


        if (message.ms().equals("msCliente-aprovado")){
            contaCUDService.aprovarCliente(message.cpf());
        }




        if (message.ms().equals("msGerente-criar")) {
            GerenteDTO gerenteTemp = new GerenteDTO(message.cpf(), message.nome());
            contaCUDService.adicionarGerente(gerenteTemp);
        }

        if (message.ms().equals("msGerente-deletar")) {
            GerenteDTO gerenteTemp = new GerenteDTO(message.cpf(), message.nome());
            contaCUDService.removerGerente(gerenteTemp);

        }

        if (message.ms().equals("msGerente-atualizar")){
            GerenteDTO gerenteTemp = new GerenteDTO(message.cpf(), message.nome());
            contaCUDService.atualizarGerente(gerenteTemp);
        }



    }


    @RabbitListener(queues = {"BancoAtt"})
    public void consumerCQRS(Map<String, Object> data) {



        String tipo = (String) data.get("mensagemTipo");

        if ("atualizar".equals(tipo)) {
            AtualizarDTO dto = objectMapper.convertValue(data, AtualizarDTO.class);
            leitorCqrsTeste(dto);
        } else if ("acao".equals(tipo)) {
            SaqueDepositoDTO dto = objectMapper.convertValue(data, SaqueDepositoDTO.class);
            consumerSaqueDeposito(dto);
        } else if ("transferir".equals(tipo)) {

            TransferenciaDTO dto = objectMapper.convertValue(data, TransferenciaDTO.class);
            transferencia(dto);

        } else {
            LOGGER.warn("Mensagem desconhecida: " + data);
        }
    }


    public void leitorCqrsTeste(AtualizarDTO data) {
        try {
            if (data.mensagemTipo().equals("atualizar")) {
                Optional<ContaR> contaTempOpt = contaRRepository.findByCpfCliente(data.cpfCliente());
                if (contaTempOpt.isPresent()) {
                    ContaR contaTemp = contaTempOpt.get();

                    contaTemp.setNomeCliente(data.nomeCliente());
                    contaTemp.setNomeGerente(data.nomeGerente());
                    contaTemp.setCpfGerente(data.cpfGerente());
                    contaTemp.setLimite(data.limite());
                    contaTemp.setAtiva(data.ativa());
                    contaRRepository.save(contaTemp);
                    LOGGER.info("Conta atualizada no banco com sucesso");

                } else{
                    ContaR contaTemp = new ContaR(data.numConta(),data.cpfCliente(), data.nomeCliente(),
                            data.saldo(), data.limite(), data.cpfGerente(),
                            data.nomeGerente(), data.dataCriacao());
                    contaRRepository.save(contaTemp);
                    LOGGER.info("Conta adicionada no banco com sucesso");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }


    public void consumerSaqueDeposito(SaqueDepositoDTO data) {
        try {
            if (data.mensagemTipo().equals("acao")) {
                Optional<ContaR> optContaTemp = contaRRepository.findByNumConta(String.valueOf(data.numConta()));
                if (optContaTemp.isPresent()) {
                    ContaR contaTemp = optContaTemp.get();
                    contaTemp.setSaldo(data.saldo());
                    MovimentacoesR movimentacaoTemp = new MovimentacoesR(data.dataHora(), data.tipo(),
                            data.clienteOrigemNome(), data.clienteOrigameCpf(),
                            data.clienteDestinoNome(), data.clieneDestinoCpf(),
                            data.valor());

                    contaRRepository.save(contaTemp);
                    movimentacaoRRepository.save(movimentacaoTemp);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void transferencia(TransferenciaDTO data) {
        try {
            if (data.mensagemTipo().equals("transferir")) {
                Optional<ContaR> optContaTemp = contaRRepository.findByNumConta(String.valueOf(data.numConta()));
                Optional<ContaR> optContaTemp2 = contaRRepository.findByNumConta(String.valueOf(data.numConta2()));

                if (optContaTemp.isPresent() && optContaTemp2.isPresent()) {
                    ContaR contaTemp = optContaTemp.get();
                    contaTemp.setSaldo(data.saldo());

                    ContaR contaTemp2 = optContaTemp2.get();
                    contaTemp2.setSaldo(data.saldo2());

                    MovimentacoesR movimentacaoTemp = new MovimentacoesR(data.dataHora(), data.tipo(),
                            data.clienteOrigemNome(), data.clienteOrigameCpf(),
                            data.clienteDestinoNome(), data.clieneDestinoCpf(),
                            data.valor());

                    contaRRepository.save(contaTemp2);
                    contaRRepository.save(contaTemp);
                    movimentacaoRRepository.save(movimentacaoTemp);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }


// teste pedro alteracaoperfil
    @RabbitListener(queues = {"AtualizarConta"})
    public void atualizarLimite(AlteracaoPerfilDTO dados) {
        ClienteDTO dadosCliente = dados.dadosAtualizados();
        System.out.println("saga->conta atualizar limite");
        
        try {
            contaCUDService.alteracaoPerfilLimite(dadosCliente.cpf(), dadosCliente.salario());
            
            System.out.println("conta->saga limite alterado suceesso");
            rabbitMQProducer.publicarEventoLimiteAtualizadoSucesso(dados);

        } catch (Exception e) {
            System.out.println("conta->saga falha limite ");
            rabbitMQProducer.publicarEventoLimiteAtualizadoFalha(dados);
        }
    }


}
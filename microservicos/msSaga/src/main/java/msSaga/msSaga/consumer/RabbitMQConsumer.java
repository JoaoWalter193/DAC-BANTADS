package msSaga.msSaga.consumer;

import msSaga.msSaga.DTO.AlteracaoPerfilDTO;
import msSaga.msSaga.DTO.AprovacaoDTO;
import msSaga.msSaga.DTO.AutocadastroDTO;
import msSaga.msSaga.DTO.ClienteDTO;
import msSaga.msSaga.producer.RabbitMQProducer;
import msSaga.msSaga.services.SagaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    private final RabbitMQProducer rabbitMQProducer;
    private final SagaService sagaService;

    public RabbitMQConsumer(RabbitMQProducer rabbitMQProducer, SagaService sagaService) {
        this.rabbitMQProducer = rabbitMQProducer;
        this.sagaService = sagaService;
    }

    
    @RabbitListener(queues = "${rabbitmq.queue.saga-default:MsSaga}")
    public void receberRespostaSaga(AutocadastroDTO dto) {
        LOGGER.info("SAGA Recebeu evento Autocadastro: Step={} | Status={}", dto.stepAtual(), dto.status());
        sagaService.orquestrarAutocadastro(dto);
    }


    @RabbitListener(queues = "${rabbitmq.queue.saga-response:queue-saga-resposta}")
    public void orquestrarAprovacao(AprovacaoDTO resposta) {
        
        LOGGER.info("SAGA ORCHESTRATOR (Aprovação): Recebi resposta. Passo: {} | Erro: {}", resposta.stepAtual(), resposta.mensagemErro());

        if ("FALHA".equals(resposta.mensagemErro()) || "ERRO".equals(resposta.mensagemErro())) {
            LOGGER.error("SAGA FALHOU NO PASSO: {}. Motivo: {}", resposta.stepAtual(), resposta.mensagemErro());
            return;
        }

        switch (resposta.stepAtual()) {
            case "CLIENTE_APROVADO":
                LOGGER.info("Saga: Cliente aprovado. Enviando para MS-Conta criar conta...");
                rabbitMQProducer.enviarCriacaoContaAprovada(resposta);
                break;

            case "CONTA_CRIADA":
                LOGGER.info("Saga: Conta criada. Enviando para MS-Auth gerar credenciais...");
                
                AprovacaoDTO proximoPassoAuth = new AprovacaoDTO(
                    resposta.sagaId(),
                    resposta.cpf(),
                    resposta.nome(),
                    "CRIAR_AUTH",
                    "PENDENTE",
                    null,
                    resposta.salario(),
                    resposta.email()
                );
                rabbitMQProducer.enviarAprovacaoAuth(proximoPassoAuth);
                break;

            case "AUTH_CRIADO":
                LOGGER.info("SAGA FINALIZADA COM SUCESSO! Cliente: {} ativo.", resposta.nome());
                break;

            default:
                LOGGER.warn("Passo desconhecido na saga de aprovação: {}", resposta.stepAtual());
                break;
        }
    }

    @RabbitListener(queues = "${rabbitmq.queue.atualizacao-cliente-sucesso:AtualizacaoClienteSucesso}")
    public void clienteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        LOGGER.info("Saga (Perfil): Cliente atualizado com sucesso. Solicitando atualização de limite de conta.");
        
        try {
            rabbitMQProducer.sendAtualizarLimite(dados);
        } catch (Exception e) {
            LOGGER.error("Saga Consumer (Perfil): Erro ao enviar solicitação de limite.", e);
            rabbitMQProducer.sendAtualizarFalha(dados.dadosOriginais());
        }
    }
    
    @RabbitListener(queues = "${rabbitmq.queue.atualizacao-conta-sucesso:AtualizacaoContaSucesso}")
    public void contaAtualizadaSucesso(AlteracaoPerfilDTO dados) { 
        LOGGER.info("Saga (Perfil): Fluxo finalizado com SUCESSO. Conta e Cliente atualizados.");
    }

    @RabbitListener(queues = "${rabbitmq.queue.atualizacao-conta-falha:AtualizacaoContaFalha}")
    public void contaAtualizadaFalha(AlteracaoPerfilDTO dados) {
        LOGGER.error("Saga (Perfil): Falha na atualização da conta. Iniciando rollback do cliente.");
        
        try {
            ClienteDTO dadosClienteOriginais = dados.dadosOriginais();            
            rabbitMQProducer.sendAtualizarFalha(dadosClienteOriginais);
            LOGGER.info("Saga (Perfil): Rollback enviado para MS-Cliente.");
        } catch (Exception e) {
            LOGGER.error("Saga (Perfil): ERRO CRÍTICO NA REVERSÃO.", e);
        }
    }
}
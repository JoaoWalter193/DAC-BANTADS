package msSaga.msSaga.services;

import msSaga.msSaga.DTO.*;
import msSaga.msSaga.domain.SagaStatus;
import msSaga.msSaga.domain.SagaStep;
import msSaga.msSaga.producer.RabbitMQProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SagaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SagaService.class);
    private final RabbitMQProducer rabbitMQProducer;

    public SagaService(RabbitMQProducer rabbitMQProducer) {
        this.rabbitMQProducer = rabbitMQProducer;
    }

    // --- SAGA 1: AUTOCADASTRO ---
    public void iniciarAutocadastro(AutocadastroDTO data) {
        AutocadastroDTO saga = new AutocadastroDTO(
                UUID.randomUUID(),
                SagaStep.INICIO,
                SagaStatus.SUCESSO,
                null,
                data.cpf(),
                data.email(),
                data.nome(),
                data.salario(),
                data.endereco(),
                data.cep(),
                data.cidade(),
                data.estado(),
                null,
                null,
                null,
                null);

        LOGGER.info("Iniciando Saga Autocadastro: {}", saga.sagaId());
        orquestrarAutocadastro(saga);
    }

    public void orquestrarAutocadastro(AutocadastroDTO saga) {
        if (saga.status() == SagaStatus.ERRO) {
            LOGGER.error("ROLLBACK SAGA AUTOCADASTRO: {}", saga.mensagemErro());
            rabbitMQProducer.enviarRollbackCliente(saga); 
            return;
        }

        switch (saga.stepAtual()) {
            case INICIO:
                rabbitMQProducer.enviarParaMsCliente(saga);
                break;
            case CLIENTE_CRIADO:
                rabbitMQProducer.enviarParaMsAuth(saga);
                break;
            case AUTH_CRIADO:
                LOGGER.info("Auth criado (ID: {}). Enviando para MS-Conta...", saga.idAuthCriado());
                rabbitMQProducer.enviarParaMsConta(saga);
                break;
            default:
                LOGGER.warn("Passo desconhecido no Autocadastro: {}", saga.stepAtual());
        }
    }

    // --- SAGA 2: APROVAÇÃO DE CLIENTE ---
    public void iniciarAprovarCliente(String cpf) {
        AprovacaoDTO saga = new AprovacaoDTO(
                UUID.randomUUID(),
                cpf,
                null,
                "INICIO",
                "SUCESSO",
                null,
                null,
                null
        );
    
        LOGGER.info("Iniciando Saga Aprovação (Busca Dados): {}", cpf);
        orquestrarAprovacao(saga);
    }

    public void orquestrarAprovacao(AprovacaoDTO saga) {
        if ("ERRO".equals(saga.mensagemErro()) || "FALHA".equals(saga.mensagemErro())) {
            LOGGER.error("ERRO NA SAGA APROVAÇÃO: {}", saga.mensagemErro());
            return;
        }

        switch (saga.stepAtual()) {
            case "INICIO":
                LOGGER.info("SAGA: Enviando para MS-Cliente aprovar e buscar dados...");
                rabbitMQProducer.enviarAprovacaoCliente(saga);
                break;
        }
    }

    public void iniciarInsercaoGerente(GerenteMsDTO data) {
        LOGGER.info("Iniciando Saga Inserção de Gerente: {}", data.nome());

        GerenteMsDTO dtoSaga = new GerenteMsDTO(
                data.cpf(), 
                data.nome(), 
                data.email(), 
                data.tipo(), 
                data.senha(), 
                "Criar"
        );

        rabbitMQProducer.enviarSagaGerente(dtoSaga);
    }

    public void iniciarAtualizacaoGerente(String cpf, GerenteAttDTO data) {
        LOGGER.info("Iniciando Saga Atualização de Gerente: {}", cpf);

        GerenteMsDTO dtoSaga = new GerenteMsDTO(
                cpf, 
                data.nome(), 
                data.email(), 
                null,
                data.senha(),
                "Atualizar"
        );
        
        rabbitMQProducer.enviarSagaGerente(dtoSaga);
    }

    public void iniciarRemocaoGerente(String cpf) {
        LOGGER.info("Iniciando Saga Remoção de Gerente: {}", cpf);
        GerenteMsDTO dtoSaga = new GerenteMsDTO(
                cpf, 
                null, null, null, null, 
                "Deletar"
        );

        rabbitMQProducer.enviarSagaGerente(dtoSaga);
    }

    public void iniciarAlteracaoPerfil(AlteracaoPerfilDTO dados) {
        LOGGER.info("Iniciando Saga Alteração de Perfil para: {}", dados.dadosAtualizados().cpf());
        rabbitMQProducer.sendAtualizarCliente(dados);
    }
}
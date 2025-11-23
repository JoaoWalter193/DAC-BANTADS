package MSconta.producer;

import MSconta.domain.ContaCUD;
import MSconta.domain.AprovacaoDTO;
import MSconta.domain.ResponseDTO;
import MSconta.domain.AlteracaoPerfilDTO;
import MSconta.domain.DTOCqrs.AtualizarDTO;
import MSconta.domain.DTOCqrs.SaqueDepositoDTO;
import MSconta.domain.DTOCqrs.TransferenciaDTO;
import MSconta.domain.movimentacoes.Movimentacoes;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("exchangePrincipal")
    private String exchange;

    private static final String ROUTING_KEY_SAGA_RESPOSTA = "MsSaga-response";

    @Value("keySaga")
    private String routingKeySagaErro;

    public void enviarRespostaSaga(AprovacaoDTO saga) {
        System.out.println("MS-CONTA: Enviando resposta para: " + ROUTING_KEY_SAGA_RESPOSTA);
        rabbitTemplate.convertAndSend(exchange, ROUTING_KEY_SAGA_RESPOSTA, saga);
    }

    public void enviarRespostaSagaAprovacao(AprovacaoDTO saga) {
        enviarRespostaSaga(saga);
    }

    public void sendMessageErroCliente(String cpf) {
        ResponseDTO dto = new ResponseDTO(500, cpf, null, null, "Erro ms-conta -- criar cliente");
        rabbitTemplate.convertAndSend(exchange, routingKeySagaErro, dto);
    }


    @Value("keyBanco")
    private String routingKeyCQRS;

    public void sendMessageCQRSAddUpdateConta(ContaCUD contaCUD) {
        AtualizarDTO dtoTemp = new AtualizarDTO(contaCUD.getNumConta(), contaCUD.getCpfCliente(),
                contaCUD.getNomeCliente(), contaCUD.getSaldo(), contaCUD.getLimite(),
                contaCUD.getCpfGerente(), contaCUD.getNomeGerente(), contaCUD.getDataCriacao(),
                true, "atualizar");
        rabbitTemplate.convertAndSend(exchange, routingKeyCQRS, dtoTemp);
    }

    public void sendMessageCQRSDepositoSaque(ContaCUD contaCUDTemp, Movimentacoes movimentacoes) {
        SaqueDepositoDTO dtoTemp = new SaqueDepositoDTO(contaCUDTemp.getNumConta(), contaCUDTemp.getSaldo(),
                movimentacoes.getId(), movimentacoes.getDataHora(), movimentacoes.getTipo(),
                movimentacoes.getClienteOrigemNome(), movimentacoes.getClienteOrigemCpf(),
                movimentacoes.getClienteDestinoNome(), movimentacoes.getClienteDestinoCpf(),
                movimentacoes.getValor(), "acao");
        rabbitTemplate.convertAndSend(exchange, routingKeyCQRS, dtoTemp);
    }

    public void sendMessageCQRSTransferir(ContaCUD contaCUDTemp, Movimentacoes movimentacoes, ContaCUD contaCUDTemp2) {
        TransferenciaDTO dtoTemp = new TransferenciaDTO(contaCUDTemp.getNumConta(), contaCUDTemp.getSaldo(),
                movimentacoes.getId(), movimentacoes.getDataHora(), movimentacoes.getTipo(),
                movimentacoes.getClienteOrigemNome(), movimentacoes.getClienteOrigemCpf(),
                movimentacoes.getClienteDestinoNome(), movimentacoes.getClienteDestinoCpf(),
                movimentacoes.getValor(), contaCUDTemp2.getNumConta(), contaCUDTemp2.getSaldo(), "transferir");
        rabbitTemplate.convertAndSend(exchange, routingKeyCQRS, dtoTemp);
    }

    @Value("keyAtualizacaoContaSucesso")
    private String routingKeySagaContaSucesso;

    @Value("keyAtualizacaoContaFalha")
    private String routingKeySagaContaFalha;

    public void publicarEventoLimiteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        rabbitTemplate.convertAndSend(exchange, routingKeySagaContaSucesso, dados);
    }

    public void publicarEventoLimiteAtualizadoFalha(AlteracaoPerfilDTO dados) {
        rabbitTemplate.convertAndSend(exchange, routingKeySagaContaFalha, dados);
    }
}
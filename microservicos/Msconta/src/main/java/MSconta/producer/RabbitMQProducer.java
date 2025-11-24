package MSconta.producer;


import MSconta.domain.*;
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

    @Value("exchangePrincipal")
    private String exchange;
    @Value("keyBanco")
    private String routingKeyCQRS;

    @Value("keySaga")
    private String routingKeySaga;

    @Value("keyCliente")
    private String routingKeyCliente;

// teste pedro alteracaopedril
    @Value("keyAtualizacaoContaSucesso")
    private String routingKeySagaContaSucesso;
    @Value("keyAtualizacaoContaFalha")
    private String routingKeySagaContaFalha;


    @Autowired
    private RabbitTemplate rabbitTemplate;


    public void sendMessageCQRSAddUpdateConta(ContaCUD contaCUD){
        AtualizarDTO dtoTemp = new AtualizarDTO(contaCUD.getNumConta(),
                contaCUD.getCpfCliente(),
                contaCUD.getNomeCliente(),
                contaCUD.getSaldo(),
                contaCUD.getLimite(),
                contaCUD.getCpfGerente(),
                contaCUD.getNomeGerente(),
                contaCUD.getDataCriacao(),
                contaCUD.isAtiva(),
                "atualizar");

        rabbitTemplate.convertAndSend(exchange,routingKeyCQRS,dtoTemp);
    }


    public void sendMessageCQRSDepositoSaque(ContaCUD contaCUDTemp, Movimentacoes movimentacoes) {
        SaqueDepositoDTO dtoTemp = new SaqueDepositoDTO(contaCUDTemp.getNumConta(),
                contaCUDTemp.getSaldo(),
                movimentacoes.getId(),
                movimentacoes.getData(),
                movimentacoes.getTipo(),
                movimentacoes.getClienteOrigemNome(),
                movimentacoes.getClienteOrigemCpf(),
                movimentacoes.getClienteDestinoNome(),
                movimentacoes.getClienteDestinoCpf(),
                movimentacoes.getValor(),
                "acao");

        rabbitTemplate.convertAndSend(exchange,routingKeyCQRS,dtoTemp);
    }

    public void sendMessageCQRSTransferir(ContaCUD contaCUDTemp, Movimentacoes movimentacoes, ContaCUD contaCUDTemp2){
        TransferenciaDTO dtoTemp = new TransferenciaDTO(contaCUDTemp.getNumConta(),
                contaCUDTemp.getSaldo(),
                movimentacoes.getId(),
                movimentacoes.getData(),
                movimentacoes.getTipo(),
                movimentacoes.getClienteOrigemNome(),
                movimentacoes.getClienteOrigemCpf(),
                movimentacoes.getClienteDestinoNome(),
                movimentacoes.getClienteDestinoCpf(),
                movimentacoes.getValor(),
                contaCUDTemp2.getNumConta(),
                contaCUDTemp2.getSaldo(),
                "transferir");
        rabbitTemplate.convertAndSend(exchange,routingKeyCQRS,dtoTemp);
    }

    public void sendMessageErroCliente(String cpf){

        ResponseDTO dto = new ResponseDTO(500,cpf,
                null,null,
                "Erro ms-origem -- criar cliente");
        rabbitTemplate.convertAndSend(exchange, routingKeySaga,dto);

    }


// teste pedro alteracaoperfil
    public void publicarEventoLimiteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        System.out.println("origem->saga teste sucesso ");
        rabbitTemplate.convertAndSend(exchange, routingKeySagaContaSucesso, dados);
    }

    public void publicarEventoLimiteAtualizadoFalha(AlteracaoPerfilDTO dados) {
        System.out.println("origem->saga teste falha");
        rabbitTemplate.convertAndSend(exchange, routingKeySagaContaFalha, dados);
    }
}

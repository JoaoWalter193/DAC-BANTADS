package MSconta.producer;


import MSconta.domain.ContaCUD;
import MSconta.domain.DTO.AtualizarDTO;
import MSconta.domain.DTO.SaqueDepositoDTO;
import MSconta.domain.movimentacoes.Movimentacoes;
import MSconta.domain.movimentacoes.MovimentacoesR;
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
                "atualizar");

        rabbitTemplate.convertAndSend(exchange,routingKeyCQRS,dtoTemp);
    }


    public void sendMessageCQRSDepositoSaque(ContaCUD contaCUDTemp, Movimentacoes movimentacoes) {
        SaqueDepositoDTO dtoTemp = new SaqueDepositoDTO(contaCUDTemp.getNumConta(),
                contaCUDTemp.getCpfCliente(),
                contaCUDTemp.getNomeCliente(),
                contaCUDTemp.getSaldo(),
                contaCUDTemp.getLimite(),
                contaCUDTemp.getCpfGerente(),
                contaCUDTemp.getNomeGerente(),
                contaCUDTemp.getDataCriacao(),
                movimentacoes.getId(),
                movimentacoes.getDataHora(),
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


    }


}

package MSconta.consumer;



import MSconta.domain.ContaR;
import MSconta.domain.DTO.AtualizarDTO;
import MSconta.domain.DTO.SaqueDepositoDTO;
import MSconta.domain.movimentacoes.MovimentacoesR;
import MSconta.repositories.r.ContaRRepository;
import MSconta.repositories.r.MovimentacaoRRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RabbitMQConsumer {


    // usasdos para atualizar via CQRS
    @Autowired
    ContaRRepository contaRRepository;

    @Autowired
    MovimentacaoRRepository movimentacaoRRepository;



    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = {"MsConta"})
    public void consume(String message) {
        LOGGER.info(String.format("Menasgem consumida -> %s", message));
    }



    @RabbitListener(queues = {"BancoAtt"})
    public void leitorCqrsTeste(AtualizarDTO data){
        try {
            if (data.mensagemTipo().equals("atualizar")) {
                ContaR contaTemp = new ContaR(data.cpfCliente(), data.nomeCliente(),
                        data.saldo(), data.limite(), data.cpfGerente(),
                        data.nomeGerente(), data.dataCriacao());
                contaRRepository.save(contaTemp);
                LOGGER.info("Conta adicionada/atualizada no banco com sucesso");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }


    @RabbitListener(queues = {"BancoAtt"})
    public void consumerSaqueDeposito(SaqueDepositoDTO data){
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





/*

    @RabbitListener(queues = {"BancoAtt"})
    public void leituraCQRS(MensagemGenericaDTO mensagem){
        try {
            ContaR contaRTemp = new ContaR(mensagem.contaR());
            contaRRepository.save(contaRTemp);

            if (mensagem.movimentacoes() != null) {// null pois quando atualiza o limite ele não cria nenhuma movimentacao
                MovimentacoesR movTemp = new MovimentacoesR(mensagem.movimentacoes());
                movimentacaoRRepository.save(movTemp);
            }
            if (mensagem.contaRRecebedor() != null){
                ContaR contaTempRecebe = new ContaR(mensagem.contaRRecebedor());
                contaRRepository.save(contaTempRecebe);
            }

            LOGGER.info("Banco de leitura atualizado!!");
        } catch (Exception e) {
            throw  new RuntimeException(e);
        }
    }

 */


}
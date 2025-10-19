package MSconta.consumer;



import MSconta.domain.AdicionarContaDTO;
import MSconta.domain.ContaCUD;
import MSconta.domain.ContaR;
import MSconta.domain.DTOCqrs.AtualizarDTO;
import MSconta.domain.DTOCqrs.SaqueDepositoDTO;
import MSconta.domain.DTOCqrs.TransferenciaDTO;
import MSconta.domain.ResponseDTO;
import MSconta.domain.movimentacoes.MovimentacoesR;
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

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    private final ObjectMapper objectMapper;

    public RabbitMQConsumer() {
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }




    @RabbitListener(queues = {"MsConta"})
    public void consume(ResponseDTO message) {

        AdicionarContaDTO contaTemp = new AdicionarContaDTO(message.cpfCliente(),
                message.nomeCliente(),
                message.salario(),
                "07762141988",
                "Teste Nome gerente");

        contaCUDService.adicionarConta(contaTemp);
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
        } else if ("transferir".equals(tipo)){

            TransferenciaDTO dto = objectMapper.convertValue(data, TransferenciaDTO.class);
            transferencia(dto);

        } else {
            LOGGER.warn("Mensagem desconhecida: " + data);
        }
    }


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

    public void transferencia(TransferenciaDTO data){
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




}
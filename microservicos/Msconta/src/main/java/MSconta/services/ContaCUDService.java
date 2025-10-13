package MSconta.services;


import MSconta.domain.*;
import MSconta.domain.movimentacoes.Movimentacoes;
import MSconta.producer.RabbitMQProducer;
import MSconta.repositories.cud.ContaCUDRepository;
import MSconta.repositories.r.ContaRRepository;
import MSconta.repositories.cud.MovimentacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ContaCUDService {


    @Autowired
    ContaCUDRepository contaCUDRepository;

    @Autowired
    ContaRRepository contaRRepository;

    @Autowired
    MovimentacaoRepository movimentacaoRepository;

    @Autowired
    RabbitMQProducer rabbitMQProducer;



    public ResponseEntity<String> adicionarConta (AdicionarContaDTO data){
        ContaCUD contaCUDTemp = new ContaCUD(data.cpfCliente(),data.nomeCliente(),data.salario(),data.cpfGerente(),data.nomeGerente());

        Optional<ContaR> contaVerifica = contaRRepository.findByCpfCliente(data.cpfCliente());
        if (contaVerifica.isEmpty()){
            contaCUDRepository.save(contaCUDTemp);

            rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaCUDTemp);

            return ResponseEntity.ok("Conta criada com sucesso!");
        }


        return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build();
    }


    public ResponseEntity<ContaPadraoDTO> depositarCliente(String numConta, double valorDepositar) {
        Optional<ContaR> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()){
            ContaCUD contaCUDTemp = contaVerifica.get().virarContaCUD();
            double novoSaldo = contaCUDTemp.getSaldo() + valorDepositar;
            contaCUDTemp.setSaldo(novoSaldo);

             Movimentacoes movimentacoesTemp = new Movimentacoes("deposito",contaCUDTemp.getNomeCliente(),
                     contaCUDTemp.getCpfCliente(), valorDepositar);

            movimentacaoRepository.save(movimentacoesTemp);
            contaCUDRepository.save(contaCUDTemp);

            rabbitMQProducer.sendMessageCQRSDepositoSaque(contaCUDTemp,movimentacoesTemp);

            return ResponseEntity.ok(new ContaPadraoDTO(contaCUDTemp.getNumConta(),
                    contaCUDTemp.getCpfCliente(),
                    contaCUDTemp.getNomeCliente(),
                    contaCUDTemp.getSaldo(),
                    contaCUDTemp.getLimite(),
                    contaCUDTemp.getCpfGerente(),
                    contaCUDTemp.getNomeGerente(),
                    contaCUDTemp.getDataCriacao()));
        }


        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> sacarCliente(String numConta, double valorSacar){
        Optional<ContaR> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()) {
            ContaCUD contaCUDTemp = contaVerifica.get().virarContaCUD();

            if (contaCUDTemp.getSaldo() > valorSacar && contaCUDTemp.getLimite() > valorSacar) {
                double novoSaldo = contaCUDTemp.getSaldo() - valorSacar;
                contaCUDTemp.setSaldo(novoSaldo);
                Movimentacoes movimentacoesTemp = new Movimentacoes("saque",contaCUDTemp.getNomeCliente(),
                        contaCUDTemp.getCpfCliente(), valorSacar);

                movimentacaoRepository.save(movimentacoesTemp);
                contaCUDRepository.save(contaCUDTemp);

                rabbitMQProducer.sendMessageCQRSDepositoSaque(contaCUDTemp,movimentacoesTemp);


                return ResponseEntity.ok(new ContaPadraoDTO(contaCUDTemp.getNumConta(),
                        contaCUDTemp.getCpfCliente(),
                        contaCUDTemp.getNomeCliente(),
                        contaCUDTemp.getSaldo(),
                        contaCUDTemp.getLimite(),
                        contaCUDTemp.getCpfGerente(),
                        contaCUDTemp.getNomeGerente(),
                        contaCUDTemp.getDataCriacao()));

            }

            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<String> transferir (String numConta, TransferirDTO data){
        Optional<ContaR> contaVerificaDono = contaRRepository.findByNumConta(numConta);
        Optional<ContaR> contaVerificaRecebedor = contaRRepository.findByNumConta(data.numeroConta());
        if (contaVerificaDono.isPresent() && contaVerificaRecebedor.isPresent()){
            ContaCUD contaCUDDono = contaVerificaDono.get().virarContaCUD();
            ContaCUD contaCUDRecebedor = contaVerificaRecebedor.get().virarContaCUD();

            contaCUDDono.setSaldo(contaCUDDono.getSaldo()-data.valor());
            contaCUDRecebedor.setSaldo(contaCUDRecebedor.getSaldo()+ data.valor());

            Movimentacoes movimentacoesTemp = new Movimentacoes("deposito",contaCUDDono.getNomeCliente(),
                    contaCUDDono.getCpfCliente(), contaCUDRecebedor.getNomeCliente(), contaCUDRecebedor.getCpfCliente(),
                    data.valor());

            movimentacaoRepository.save(movimentacoesTemp);
            contaCUDRepository.save(contaCUDDono);
            contaCUDRepository.save(contaCUDRecebedor);

            rabbitMQProducer.sendMessageCQRSTransferir(contaCUDDono,movimentacoesTemp,contaCUDRecebedor);



            return ResponseEntity.ok("Saldo transferido com sucesso");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> atualizarLimite(String numConta, double valor){
        Optional<ContaR> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()) {
            ContaCUD contaCUDTemp = contaVerifica.get().virarContaCUD();
            contaCUDTemp.setLimite(valor);
            contaCUDRepository.save(contaCUDTemp);

            rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaCUDTemp);


            return ResponseEntity.ok(new ContaPadraoDTO(contaCUDTemp.getNumConta(), contaCUDTemp.getCpfCliente(),
                    contaCUDTemp.getNomeCliente(),contaCUDTemp.getSaldo(), contaCUDTemp.getLimite(),
                    contaCUDTemp.getCpfGerente(), contaCUDTemp.getNomeGerente(), contaCUDTemp.getDataCriacao()));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


}

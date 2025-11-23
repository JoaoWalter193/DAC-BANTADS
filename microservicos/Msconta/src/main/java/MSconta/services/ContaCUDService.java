package MSconta.services;

import MSconta.domain.*;
import MSconta.domain.movimentacoes.Movimentacoes;
import MSconta.producer.RabbitMQProducer;
import MSconta.repositories.cud.ContaCUDRepository;
import MSconta.repositories.r.ContaRRepository;
import MSconta.repositories.cud.MovimentacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

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

    @Transactional
    public AprovacaoDTO criarContaAprovada(AprovacaoDTO saga) {
        try {
            System.out.println("DEBUG - Criando conta para CPF: " + saga.cpf());

            Optional<ContaR> existente = contaRRepository.findByCpfCliente(saga.cpf());
            if (existente.isPresent()) {
                System.out.println("Conta já existente. Retornando sucesso.");
                return new AprovacaoDTO(saga.sagaId(), saga.cpf(), saga.nome(), 
                        "CONTA_CRIADA", "SUCESSO", null, saga.salario(), saga.email());
            }

            GerenteDTO gerenteTemp = contaRRepository
                    .findGerentesOrdenadosPorQuantidadeDeContas(PageRequest.of(0, 1))
                    .stream()
                    .findFirst()
                    .orElse(null);


            String nomeCliente = (saga.nome() != null) ? saga.nome() : "Cliente " + saga.cpf();
            
            double salarioCliente = saga.salario();

            double limiteCalculado = 0.0;
            if (salarioCliente >= 2000.0) {
                limiteCalculado = salarioCliente / 2.0;
            }

            ContaCUD novaConta = new ContaCUD();
            novaConta.setNumConta(gerarNumeroContaUnico());
            novaConta.setCpfCliente(saga.cpf());
            novaConta.setNomeCliente(nomeCliente);
            novaConta.setSaldo(0.0);
            novaConta.setLimite(limiteCalculado);
            novaConta.setCpfGerente(gerenteTemp.cpfGerente());
            novaConta.setNomeGerente(gerenteTemp.nomeGerente());
            
            novaConta.setDataCriacao(LocalDate.now());
            
            novaConta.setAtiva(true);

            contaCUDRepository.save(novaConta);
            rabbitMQProducer.sendMessageCQRSAddUpdateConta(novaConta);

            System.out.println("Conta criada com sucesso REAL para CPF: " + saga.cpf());

            return new AprovacaoDTO(
                saga.sagaId(),
                saga.cpf(),
                nomeCliente,    
                "CONTA_CRIADA",
                "SUCESSO",
                null,
                salarioCliente,
                saga.email()
            );

        } catch (Exception e) {
            System.err.println("ERRO FATAL AO SALVAR CONTA: " + e.getMessage());
            e.printStackTrace();
            return new AprovacaoDTO(saga.sagaId(), saga.cpf(), saga.nome(), 
                    "CONTA_ERRO", "FALHA", e.getMessage(), saga.salario(), saga.email());
        }
    }

    @Transactional
    public void executarSagaRollback(AutocadastroDTO saga) {
    }

    public ResponseEntity<String> adicionarConta(AdicionarContaDTO data) {
        try {
            GerenteDTO gerenteTemp = contaRRepository
                    .findGerentesOrdenadosPorQuantidadeDeContas(PageRequest.of(0, 1))
                    .stream().findFirst().orElse(null);

            if (gerenteTemp == null) return ResponseEntity.internalServerError().body("Sem gerentes");

            ContaCUD contaCUDTemp = new ContaCUD();
            contaCUDTemp.setNumConta(gerarNumeroContaUnico());
            contaCUDTemp.setCpfCliente(data.cpfCliente());
            contaCUDTemp.setNomeCliente(data.nomeCliente());
            contaCUDTemp.setSaldo(data.salario());
            contaCUDTemp.setCpfGerente(gerenteTemp.cpfGerente());
            contaCUDTemp.setNomeGerente(gerenteTemp.nomeGerente());
            contaCUDTemp.setAtiva(true);
            contaCUDTemp.setDataCriacao(LocalDate.now()); 

            if (contaRRepository.findByCpfCliente(data.cpfCliente()).isEmpty()) {
                contaCUDRepository.save(contaCUDTemp);
                rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaCUDTemp);
                return ResponseEntity.ok("Conta criada com sucesso!");
            }
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build();
        } catch (Exception e) {
            rabbitMQProducer.sendMessageErroCliente(data.cpfCliente());
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<ContaPadraoDTO> depositarCliente(Integer numConta, double valorDepositar) {
        Optional<ContaR> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()) {
            ContaCUD contaCUDTemp = contaVerifica.get().virarContaCUD();
            double novoSaldo = contaCUDTemp.getSaldo() + valorDepositar;
            contaCUDTemp.setSaldo(novoSaldo);

            Movimentacoes movimentacoesTemp = new Movimentacoes("deposito", contaCUDTemp.getNomeCliente(),
                    contaCUDTemp.getCpfCliente(), valorDepositar);

            movimentacaoRepository.save(movimentacoesTemp);
            contaCUDRepository.save(contaCUDTemp);
            rabbitMQProducer.sendMessageCQRSDepositoSaque(contaCUDTemp, movimentacoesTemp);

            return ResponseEntity.ok(converterParaDTO(contaCUDTemp));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> sacarCliente(Integer numConta, double valorSacar) {
        Optional<ContaR> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()) {
            ContaCUD contaCUDTemp = contaVerifica.get().virarContaCUD();

            if ((contaCUDTemp.getSaldo() + contaCUDTemp.getLimite()) >= valorSacar) {
                double novoSaldo = contaCUDTemp.getSaldo() - valorSacar;
                contaCUDTemp.setSaldo(novoSaldo);
                Movimentacoes movimentacoesTemp = new Movimentacoes("saque", contaCUDTemp.getNomeCliente(),
                        contaCUDTemp.getCpfCliente(), valorSacar);

                movimentacaoRepository.save(movimentacoesTemp);
                contaCUDRepository.save(contaCUDTemp);
                rabbitMQProducer.sendMessageCQRSDepositoSaque(contaCUDTemp, movimentacoesTemp);

                return ResponseEntity.ok(converterParaDTO(contaCUDTemp));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<String> transferir(Integer numConta, TransferirDTO data) {
        Optional<ContaR> contaVerificaDono = contaRRepository.findByNumConta(numConta);
        Optional<ContaR> contaVerificaRecebedor = contaRRepository.findByNumConta(data.numeroConta());
        
        if (contaVerificaDono.isPresent() && contaVerificaRecebedor.isPresent()) {
            ContaCUD contaCUDDono = contaVerificaDono.get().virarContaCUD();
            ContaCUD contaCUDRecebedor = contaVerificaRecebedor.get().virarContaCUD();

            contaCUDDono.setSaldo(contaCUDDono.getSaldo() - data.valor());
            contaCUDRecebedor.setSaldo(contaCUDRecebedor.getSaldo() + data.valor());

            Movimentacoes movimentacoesTemp = new Movimentacoes("transferencia", contaCUDDono.getNomeCliente(),
                    contaCUDDono.getCpfCliente(), contaCUDRecebedor.getNomeCliente(), contaCUDRecebedor.getCpfCliente(),
                    data.valor());

            movimentacaoRepository.save(movimentacoesTemp);
            contaCUDRepository.save(contaCUDDono);
            contaCUDRepository.save(contaCUDRecebedor);

            rabbitMQProducer.sendMessageCQRSTransferir(contaCUDDono, movimentacoesTemp, contaCUDRecebedor);
            return ResponseEntity.ok("Saldo transferido com sucesso");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public void removerGerente(GerenteDTO gerenteExcluir) {
        List<ContaR> listaContasR = contaRRepository.findAllByCpfGerente(gerenteExcluir.cpfGerente());
        GerenteDTO gerenteTemp = contaRRepository.findGerentesOrdenadosPorQuantidadeDeContas(PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);

        if (gerenteTemp != null) {
            List<ContaCUD> listContas = new ArrayList<>();
            for (ContaR conta : listaContasR) {
                conta.setNomeGerente(gerenteTemp.nomeGerente());
                conta.setCpfGerente(gerenteTemp.cpfGerente());
                listContas.add(conta.virarContaCUD());
            }
            contaCUDRepository.saveAll(listContas);
            listContas.forEach(c -> rabbitMQProducer.sendMessageCQRSAddUpdateConta(c));
        }
    }

    public void adicionarGerente(GerenteDTO gerenteAdd) {
        Optional<ContaR> contaTemp = contaRRepository.findContaAtivaDoGerenteComMaisContas();
        if (contaTemp.isPresent()) {
            ContaCUD conta = contaTemp.get().virarContaCUD();
            conta.setCpfGerente(gerenteAdd.cpfGerente());
            conta.setNomeGerente(gerenteAdd.nomeGerente());
            contaCUDRepository.save(conta);
            rabbitMQProducer.sendMessageCQRSAddUpdateConta(conta);
        }
    }

    public void atualizarGerente(GerenteDTO gerenteAtt) {
        List<ContaR> contasGerente = contaRRepository.findAllByCpfGerente(gerenteAtt.cpfGerente());
        List<ContaCUD> contaCudTemp = new ArrayList<>();
        for (ContaR conta : contasGerente) {
            ContaCUD contaTemp = conta.virarContaCUD();
            contaTemp.setNomeGerente(gerenteAtt.nomeGerente());
            contaCudTemp.add(contaTemp);
        }
        contaCUDRepository.saveAll(contaCudTemp);
        contaCudTemp.forEach(c -> rabbitMQProducer.sendMessageCQRSAddUpdateConta(c));
    }

    public ContaCUD alteracaoPerfilLimite(String cpfCliente, double novoSalario) {
        Optional<ContaR> contaOpt = contaRRepository.findByCpfCliente(cpfCliente);
        if (contaOpt.isEmpty()) throw new RuntimeException("Conta não encontrada");
        
        ContaCUD conta = contaOpt.get().virarContaCUD();
        double novoLimite = (novoSalario >= 2000) ? novoSalario / 2 : 0;
        
        if (conta.getSaldo() < 0 && novoLimite < Math.abs(conta.getSaldo())) {
            novoLimite = Math.abs(conta.getSaldo());
        }
        conta.setLimite(novoLimite);
        ContaCUD contaSalva = contaCUDRepository.save(conta);
        rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaSalva);
        return contaSalva;
    }

    private int gerarNumeroContaUnico() {
        int tentativas = 0;
        Random random = new Random();
        int numeroConta;
        do {
            numeroConta = random.nextInt(9000) + 1000;
            tentativas++;
            if (tentativas > 100) throw new RuntimeException("Erro ao gerar número de conta único");
        } while (contaRRepository.existsByNumConta(numeroConta));
        return numeroConta;
    }

    private ContaPadraoDTO converterParaDTO(ContaCUD c) {
        return new ContaPadraoDTO(c.getNumConta(), c.getCpfCliente(), c.getNomeCliente(),
                c.getSaldo(), c.getLimite(), c.getCpfGerente(), c.getNomeGerente(),
                c.getDataCriacao(), c.isAtiva());
    }
}
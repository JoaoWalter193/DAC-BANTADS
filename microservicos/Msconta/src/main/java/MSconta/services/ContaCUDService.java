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



    public ResponseEntity<String> adicionarConta (AdicionarContaDTO data) {

        try {
            //Lógica para achar o gerente que tem menos cliente e alocar esta origem a ele
            GerenteDTO gerenteTemp = contaRRepository
                    .findGerentesOrdenadosPorQuantidadeDeContas(PageRequest.of(0, 1))
                    .stream()
                    .findFirst()
                    .orElse(null);

            ContaCUD contaCUDTemp = new ContaCUD(gerarNumeroContaUnico(), data.cpfCliente(), data.nomeCliente(), data.salario(), gerenteTemp.cpfGerente(), gerenteTemp.nomeGerente());
            contaCUDTemp.setAtiva(false);

            Optional<ContaR> contaVerifica = contaRRepository.findByCpfCliente(data.cpfCliente());
            if (contaVerifica.isEmpty()) {
                contaCUDRepository.save(contaCUDTemp);

                rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaCUDTemp);

                return ResponseEntity.ok("Conta criada com sucesso!");

            }


            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build();
        } catch (Exception e){
            rabbitMQProducer.sendMessageErroCliente(data.cpfCliente());
            return ResponseEntity.internalServerError().build();
        }
    }


    public ResponseEntity<ContaPadraoDTO> depositarCliente(String numConta, double valorDepositar) {
        Optional<ContaR> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()){
            ContaCUD contaCUDTemp = contaVerifica.get().virarContaCUD();
            double novoSaldo = contaCUDTemp.getSaldo() + valorDepositar;
            contaCUDTemp.setSaldo(novoSaldo);

             Movimentacoes movimentacoesTemp = new Movimentacoes("depósito",contaCUDTemp.getNomeCliente(),
                     contaCUDTemp.getCpfCliente(), valorDepositar, contaCUDTemp.getNumConta());

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
                    contaCUDTemp.getDataCriacao(),
                    contaCUDTemp.isAtiva()));
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
                        contaCUDTemp.getCpfCliente(), valorSacar, contaCUDTemp.getNumConta());

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
                        contaCUDTemp.getDataCriacao(),
                        contaCUDTemp.isAtiva()));

            }

            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<MensagemDTO> transferir (String numConta, TransferirDTO data){
        Optional<ContaR> contaVerificaDono = contaRRepository.findByNumConta(numConta);
        Optional<ContaR> contaVerificaRecebedor = contaRRepository.findByNumConta(data.numeroConta());
        if (contaVerificaDono.isPresent() && contaVerificaRecebedor.isPresent()){
            ContaCUD contaCUDDono = contaVerificaDono.get().virarContaCUD();
            ContaCUD contaCUDRecebedor = contaVerificaRecebedor.get().virarContaCUD();



            contaCUDDono.setSaldo(contaCUDDono.getSaldo()-data.valor());
            contaCUDRecebedor.setSaldo(contaCUDRecebedor.getSaldo()+ data.valor());

            Movimentacoes movimentacoesTemp = new Movimentacoes("depósito",contaCUDDono.getNomeCliente(),
                    contaCUDDono.getCpfCliente(), contaCUDRecebedor.getNomeCliente(), contaCUDRecebedor.getCpfCliente(),
                    data.valor(), contaCUDDono.getNumConta());

            movimentacaoRepository.save(movimentacoesTemp);
            contaCUDRepository.save(contaCUDDono);
            contaCUDRepository.save(contaCUDRecebedor);

            rabbitMQProducer.sendMessageCQRSTransferir(contaCUDDono,movimentacoesTemp,contaCUDRecebedor);



            return ResponseEntity.ok(new MensagemDTO(numConta, data.numeroConta(), data.valor(),contaCUDDono.getSaldo(), movimentacoesTemp.getData()));
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
                    contaCUDTemp.getCpfGerente(), contaCUDTemp.getNomeGerente(), contaCUDTemp.getDataCriacao(),
                    contaCUDTemp.isAtiva()));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public void removerGerente (GerenteDTO gerenteExcluir) {

        // vai buscar TODAS as contas (incluindo as inativas) do gerente que vai ser excluído, gerar uma lista com ela,
        // procurar o gerente com menos contas ATIVAS e fazer um FOR para jogar todas as contas do maninho excluido para ele

        // lista das contas que precisamos mudar o gerente
        List<ContaR> listaContasR =  contaRRepository.findAllByCpfGerente(gerenteExcluir.cpfGerente());

        List<ContaCUD> listContas = new ArrayList<>();

        // gerente com menos contas ATIVAS
        GerenteDTO gerenteTemp = contaRRepository
                .findGerentesOrdenadosPorQuantidadeDeContas(PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElse(null);

        for (ContaR conta : listaContasR){
            conta.setNomeGerente(gerenteTemp.nomeGerente());
            conta.setCpfGerente(gerenteTemp.cpfGerente());
            ContaCUD contaTemp = conta.virarContaCUD();

            listContas.add(contaTemp);
        }

        // n sei pq eu fiz assim, eu só quis. Achei que ia ficar mais organizado
        contaCUDRepository.saveAll(listContas);

        for (ContaCUD conta : listContas){
            rabbitMQProducer.sendMessageCQRSAddUpdateConta(conta);
        }





    }

    public void adicionarGerente (GerenteDTO gerenteAdd){

        // vai buscar o gerente que possui mais origem, pegar uma origem dele, e jogar para o gerente que foi adicinoado

        Optional<ContaR> contaTemp = contaRRepository.findContaAtivaDoGerenteComMaisContas();

        if (contaTemp.isPresent()) {
            ContaCUD conta = contaTemp.get().virarContaCUD();
            conta.setCpfGerente(gerenteAdd.cpfGerente());
            conta.setNomeGerente(gerenteAdd.nomeGerente());

            contaCUDRepository.save(conta);

            rabbitMQProducer.sendMessageCQRSAddUpdateConta(conta);
        }

    }

    public void atualizarGerente(GerenteDTO gerenteAtt){

        List<ContaR> contasGerente = contaRRepository.findAllByCpfGerente(gerenteAtt.cpfGerente());
        List<ContaCUD> contaCudTemp = new ArrayList<>();

        for (ContaR conta : contasGerente){
            ContaCUD contaTemp = conta.virarContaCUD();
            contaTemp.setNomeGerente(gerenteAtt.nomeGerente());
            contaCudTemp.add(contaTemp);
        }

        contaCUDRepository.saveAll(contaCudTemp);

        for (ContaCUD conta : contaCudTemp){
            rabbitMQProducer.sendMessageCQRSAddUpdateConta(conta);
        }

    }

    public void aprovarCliente (String cpfCliente){

        Optional<ContaR> contaTemp = contaRRepository.findByCpfCliente(cpfCliente);
        if (contaTemp.isPresent()){
            ContaR contaTempR = contaTemp.get();
            ContaCUD contaCUD = contaTempR.virarContaCUD();
            contaCUD.setAtiva(true);

            contaCUDRepository.save(contaCUD);
            rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaCUD);
        }


    }

    private int gerarNumeroContaUnico() {
        int tentativas = 0;
        int numeroConta;
        Random random = new Random();

        do {
            numeroConta = random.nextInt(9000) + 1000;
            tentativas++;

            if (tentativas > 100) {
                throw new RuntimeException("Não foi possível gerar número de origem único");
            }

        } while (contaRRepository.existsByNumConta(numeroConta));

        return numeroConta;
    }


// teste pedro alteracaoperfil
// no atualizarLimite ele recebe o numConta, 
// na saga de alteracao só tenho os dados do cliente entao usei cpf
    public ContaCUD alteracaoPerfilLimite(String cpfCliente, double novoSalario) {
        // throw new RuntimeException("testar falha e reversao");
        Optional<ContaR> contaOpt = contaRRepository.findByCpfCliente(cpfCliente);
        if (contaOpt.isEmpty()) {
            throw new RuntimeException("Conta não encontrada");
        }
        ContaCUD conta = contaOpt.get().virarContaCUD();

        // calculo refeito pq recebo so o valor do novo salario
        double novoLimite = 0;
        if (novoSalario >= 2000) {
            novoLimite = novoSalario / 2;
        }
        if (conta.getSaldo() < 0 && novoLimite < Math.abs(conta.getSaldo())) {
            novoLimite = Math.abs(conta.getSaldo());
        }
        conta.setLimite(novoLimite);

        ContaCUD contaSalva = contaCUDRepository.save(conta);
        rabbitMQProducer.sendMessageCQRSAddUpdateConta(contaSalva);
        return contaSalva;
    }

}

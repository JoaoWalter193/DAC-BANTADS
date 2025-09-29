package MSconta.services;


import MSconta.domain.AdicionarContaDTO;
import MSconta.domain.ContaCUD;
import MSconta.domain.ContaPadraoDTO;
import MSconta.domain.ContaR;
import MSconta.repositories.ContaCUDRepository;
import MSconta.repositories.ContaRRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class ContaCUDService {


    @Autowired
    ContaCUDRepository contaCUDRepository;

    @Autowired
    ContaRRepository contaRRepository;


    public ResponseEntity<String> adicionarConta (AdicionarContaDTO data){
        ContaCUD contaTemp = new ContaCUD(data.cpfCliente(),data.nomeCLiente(),data.salario(),data.cpfGerente(),data.nomeGerente());
        Optional<ContaCUD> contaVerifica = contaRRepository.findByCpfCliente(data.cpfCliente());
        if (contaVerifica.isEmpty()){
            contaCUDRepository.save(contaTemp);
            return ResponseEntity.ok("Conta criada com sucesso!");
        }

        return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build();
    }


    public ResponseEntity<ContaPadraoDTO> depositarCliente(String numConta, double valorDepositar) {
        Optional<ContaCUD> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()){
            ContaCUD contaTemp = contaVerifica.get();
            double novoSaldo = contaTemp.getSaldo() + valorDepositar;
            contaTemp.setSaldo(novoSaldo);

            contaCUDRepository.save(contaTemp);
            return ResponseEntity.ok(new ContaPadraoDTO(contaTemp.getNumConta(),
                    contaTemp.getCpfCliente(),
                    contaTemp.getNomeCliente(),
                    contaTemp.getSaldo(),
                    contaTemp.getLimite(),
                    contaTemp.getCpfGerente(),
                    contaTemp.getNomeGerente(),
                    contaTemp.getDataCriacao()));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> sacarCliente(String numConta, double valorSacar){
        Optional<ContaCUD> contaVerifica = contaRRepository.findByNumConta(numConta);
        if (contaVerifica.isPresent()){
            ContaCUD contaTemp = contaVerifica.get();
            double novoSaldo = contaTemp.getSaldo() - valorSacar;
            contaTemp.setSaldo(novoSaldo);

            contaCUDRepository.save(contaTemp);
            return ResponseEntity.ok(new ContaPadraoDTO(contaTemp.getNumConta(),
                    contaTemp.getCpfCliente(),
                    contaTemp.getNomeCliente(),
                    contaTemp.getSaldo(),
                    contaTemp.getLimite(),
                    contaTemp.getCpfGerente(),
                    contaTemp.getNomeGerente(),
                    contaTemp.getDataCriacao()));

        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


}

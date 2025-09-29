package MSconta.services;


import MSconta.domain.ContaCUD;
import MSconta.domain.ContaPadraoDTO;
import MSconta.domain.ContaR;
import MSconta.repositories.ContaRRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ContaRService {

    @Autowired
    ContaRRepository contaRRepository;


    public ResponseEntity<ContaPadraoDTO> buscarCpfCLiente (String cpf){
        // tenho que implementar
        Optional<ContaCUD> optConta = contaRRepository.findByCpfCliente(cpf);

        if (optConta.isPresent()){
            ContaCUD contaTemp = optConta.get();

            ContaPadraoDTO dtoTemp = new ContaPadraoDTO(contaTemp.getNumConta(),
                    contaTemp.getCpfCliente(),
                    contaTemp.getNomeCliente(),
                    contaTemp.getSaldo(),
                    contaTemp.getLimite(),
                    contaTemp.getCpfGerente(),
                    contaTemp.getNomeGerente(),
                    contaTemp.getDataCriacao());

            return ResponseEntity.ok(dtoTemp);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> buscarContaCliente(String numConta){
        Optional<ContaCUD> optConta = contaRRepository.findByNumConta(numConta);

        if (optConta.isPresent()){
            ContaCUD contaTemp = optConta.get();

            ContaPadraoDTO dtoTemp = new ContaPadraoDTO(contaTemp.getNumConta(),
                    contaTemp.getCpfCliente(),
                    contaTemp.getNomeCliente(),
                    contaTemp.getSaldo(),
                    contaTemp.getLimite(),
                    contaTemp.getCpfGerente(),
                    contaTemp.getNomeGerente(),
                    contaTemp.getDataCriacao());

            return ResponseEntity.ok(dtoTemp);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

}

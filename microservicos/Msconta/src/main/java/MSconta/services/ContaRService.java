package MSconta.services;


import MSconta.domain.ContaPadraoDTO;
import MSconta.domain.ContaR;
import MSconta.domain.ExtratoDTO;
import MSconta.domain.movimentacoes.Movimentacoes;
import MSconta.repositories.r.ContaRRepository;
import MSconta.repositories.cud.MovimentacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContaRService {

    @Autowired
    ContaRRepository contaRRepository;

    @Autowired
    MovimentacaoRepository movimentacaoRepository;

    public ResponseEntity<ContaPadraoDTO> buscarCpfCLiente (String cpf){
        // tenho que implementar
        Optional<ContaR> optConta = contaRRepository.findByCpfCliente(cpf);

        if (optConta.isPresent()){
            ContaR contaCUDTemp = optConta.get();

            ContaPadraoDTO dtoTemp = new ContaPadraoDTO(contaCUDTemp.getNumConta(),
                    contaCUDTemp.getCpfCliente(),
                    contaCUDTemp.getNomeCliente(),
                    contaCUDTemp.getSaldo(),
                    contaCUDTemp.getLimite(),
                    contaCUDTemp.getCpfGerente(),
                    contaCUDTemp.getNomeGerente(),
                    contaCUDTemp.getDataCriacao());

            return ResponseEntity.ok(dtoTemp);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> buscarContaCliente(String numConta){
        Optional<ContaR> optConta = contaRRepository.findByNumConta(numConta);

        if (optConta.isPresent()){
            ContaR contaCUDTemp = optConta.get();

            ContaPadraoDTO dtoTemp = new ContaPadraoDTO(contaCUDTemp.getNumConta(),
                    contaCUDTemp.getCpfCliente(),
                    contaCUDTemp.getNomeCliente(),
                    contaCUDTemp.getSaldo(),
                    contaCUDTemp.getLimite(),
                    contaCUDTemp.getCpfGerente(),
                    contaCUDTemp.getNomeGerente(),
                    contaCUDTemp.getDataCriacao());

            return ResponseEntity.ok(dtoTemp);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }


    public ResponseEntity<ExtratoDTO> verExtrato(String numConta){
        Optional<ContaR> optConta = contaRRepository.findByNumConta(numConta);

        if (optConta.isPresent()){
            ContaR contaCUDTemp = optConta.get();
            List<Movimentacoes> listaTemp = movimentacaoRepository.findByClienteOrigemCpf(contaCUDTemp.getCpfCliente());

            return ResponseEntity.ok(new ExtratoDTO(contaCUDTemp.getNumConta(), contaCUDTemp.getSaldo(), listaTemp));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

}

package MSconta.services;


import MSconta.domain.ContaPadraoDTO;
import MSconta.domain.ContaR;
import MSconta.domain.ExtratoDTO;
import MSconta.domain.GerenteDTO;
import MSconta.domain.GerentesDTOs.GerenteDashDTO;
import MSconta.domain.movimentacoes.Movimentacoes;
import MSconta.repositories.r.ContaRRepository;
import MSconta.repositories.cud.MovimentacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
                    contaCUDTemp.getDataCriacao(),
                    contaCUDTemp.isAtiva());

            return ResponseEntity.ok(dtoTemp);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    public ResponseEntity<ContaPadraoDTO> buscarContaCliente(Integer numConta){
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
                    contaCUDTemp.getDataCriacao(),
                    contaCUDTemp.isAtiva());

            return ResponseEntity.ok(dtoTemp);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }


    public ResponseEntity<ExtratoDTO> verExtrato(Integer numConta){
        Optional<ContaR> optConta = contaRRepository.findByNumConta(numConta);

        if (optConta.isPresent()){
            ContaR contaCUDTemp = optConta.get();
            List<Movimentacoes> listaTemp = movimentacaoRepository.findByClienteOrigemCpf(contaCUDTemp.getCpfCliente());

            return ResponseEntity.ok(new ExtratoDTO(contaCUDTemp.getNumConta(), contaCUDTemp.getSaldo(), listaTemp));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    }

    public ResponseEntity<List<GerenteDashDTO>> buscarGerentes(){
        List<GerenteDTO> gerentes = contaRRepository.findCpfsGerentesAtivos();

        List<GerenteDashDTO> listaTemp = new ArrayList<>();

        for (GerenteDTO gerente : gerentes){

            double totalNegativo = 0;
            double totalPositivo = 0;
            List<ContaR> listaContas = contaRRepository.findAllByCpfGerente(gerente.cpfGerente()).stream().filter(ContaR::isAtiva).toList();
            for (ContaR contaR : listaContas){
                if (contaR.getSaldo() < 0){
                    totalNegativo += contaR.getSaldo();
                } else {
                    totalPositivo += contaR.getSaldo();
                }
            }


                GerenteDashDTO temp = new GerenteDashDTO(gerente.nomeGerente(),gerente.cpfGerente(),
                        listaContas, totalPositivo, totalNegativo);

                listaTemp.add(temp);
            }


        return ResponseEntity.ok(listaTemp);

    }

    public ResponseEntity<List<ContaR>> buscarMelhoresClientes() {
        List<ContaR> listaTemp = contaRRepository.findTop3ByOrderBySaldoDesc();

        return ResponseEntity.ok(listaTemp);
    }
}

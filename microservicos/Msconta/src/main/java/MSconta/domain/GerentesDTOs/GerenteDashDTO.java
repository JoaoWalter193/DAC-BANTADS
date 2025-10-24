package MSconta.domain.GerentesDTOs;

import MSconta.domain.ContaR;

import java.util.List;

public record GerenteDashDTO(String nomeGerente,
                             String cpfGerente,
                             List<ContaR> listaContas,
                             double saldoPositivo,
                             double saldoNegativo){
}

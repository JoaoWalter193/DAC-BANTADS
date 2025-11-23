package MSconta.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Table(name = "conta", schema = "dbcontar")
@Entity(name = "contaR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContaR {

    public ContaR(
            int numConta,
            String cpfCliente,
            String nomeCliente,
            double saldo,
            double limite,
            String cpfGerente,
            String nomeGerente,
            LocalDate dataCriacao) {

        this.numConta = numConta;
        this.cpfCliente = cpfCliente;
        this.nomeCliente = nomeCliente;
        this.saldo = saldo;
        this.limite = limite;
        this.cpfGerente = cpfGerente;
        this.nomeGerente = nomeGerente;
        this.dataCriacao = dataCriacao;

    }

    public ContaR(ContaR contaTemp) {
        this.numConta = contaTemp.numConta;
        this.cpfCliente = contaTemp.getCpfCliente();
        this.nomeCliente = contaTemp.getNomeCliente();
        this.saldo = contaTemp.getSaldo();
        this.limite = contaTemp.getLimite();
        this.cpfGerente = contaTemp.getCpfGerente();
        this.nomeGerente = contaTemp.getNomeGerente();
        this.dataCriacao = contaTemp.getDataCriacao();
    }

    @Id
    @Column(name = "numconta")
    private int numConta;

    @Column(name = "cpfcliente")
    private String cpfCliente;

    @Column(name = "nomecliente")
    private String nomeCliente;

    private double saldo;

    private double limite;

    @Column(name = "cpfgerente")
    private String cpfGerente;

    @Column(name = "nomegerente")
    private String nomeGerente;

    @Column(name = "datacriacao")
    private LocalDate dataCriacao;

    @Column(name = "ativa")
    private boolean ativa;

    public ContaCUD virarContaCUD() {
        return new ContaCUD(this.getNumConta(), this.getCpfCliente(),
                this.getNomeCliente(), this.getSaldo(), this.getLimite(),
                this.getCpfGerente(), this.getNomeGerente(), this.getDataCriacao(), this.ativa);
    }

}

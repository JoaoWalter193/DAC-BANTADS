package MSconta.domain;


import MSconta.repositories.r.ContaRRepository;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Random;

@Table(name = "conta", schema = "dbcontacud")
@Entity(name = "conta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContaCUD {

    public ContaCUD(int numConta,
            String cpfCliente,
                    String nomeCliente,
                    double salario,
                    String cpfGerente,
                    String nomeGerente){


        this.numConta = numConta;
        this.cpfCliente = cpfCliente;
        this.nomeCliente = nomeCliente;


        if (salario >= 2000){
            this.limite = salario/2;
        } else {
            throw new RuntimeException();
        }

        this.cpfGerente = cpfGerente;
        this.nomeGerente = nomeGerente;
        this.dataCriacao = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        this.saldo = 0.0;
        this.ativa = false;
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




    public ContaR virarContaR(){
        return new ContaR(this.getNumConta(),this.getCpfCliente(),
                this.getNomeCliente(), this.getSaldo(), this.getLimite(),
                this.getCpfGerente(), this.getNomeGerente(), this.getDataCriacao(), this.ativa);
    }


}

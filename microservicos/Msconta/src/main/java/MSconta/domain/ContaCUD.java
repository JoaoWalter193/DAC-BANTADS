package MSconta.domain;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.ZoneId;

@Table(name = "conta", schema = "dbcontacud")
@Entity(name = "contaCUD")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContaCUD {


    public ContaCUD (String cpfCliente,
                     String nomeCliente,
                     double salario,
                     String cpfGerente,
                     String nomeGerente){
        this.cpfCliente = cpfCliente;
        this.nomeCliente = nomeCliente;
        if (salario >= 2000){
            this.limite = salario/2;
        } else {
            throw new RuntimeException();
        }
        this.cpfGerente = cpfGerente;
        this.nomeGerente = nomeGerente;
        this.dataCriacao = LocalDate.now();
    }


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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



}

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

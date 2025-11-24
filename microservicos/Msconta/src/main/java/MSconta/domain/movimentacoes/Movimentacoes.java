package MSconta.domain.movimentacoes;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

@Table(name = "movimentacao", schema = "dbcontacud")
@Entity(name = "movimentacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movimentacoes {

    // para saques e depositos
    public Movimentacoes (String tipo, String clienteOrigemNome, String clienteOrigemCpf,
                          double valor, Integer origem){
        this.data = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        this.tipo = tipo;
        this.clienteOrigemNome = clienteOrigemNome;
        this.clienteOrigemCpf = clienteOrigemCpf;
        this.valor = valor;
        this.origem = origem;
    }

    // para transferencias
    public Movimentacoes(String tipo, String clienteOrigemNome, String clienteOrigemCpf,
                         String clienteDestinoNome, String clienteDestinoCpf,
                         double valor, Integer origem){
        this.data = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        this.tipo = tipo;
        this.clienteOrigemNome = clienteOrigemNome;
        this.clienteOrigemCpf = clienteOrigemCpf;
        this.clienteDestinoNome = clienteDestinoNome;
        this.clienteDestinoCpf = clienteDestinoCpf;
        this.valor = valor;
        this.origem = origem;
    }


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "datahora")
    private Instant data;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "clienteorigemnome")
    private String clienteOrigemNome;

    @Column(name = "clienteorigemcpf")
    private String clienteOrigemCpf;

    @Column(name = "clientedestinonome")
    private String clienteDestinoNome;

    @Column(name = "clientedestinocpf")
    private String clienteDestinoCpf;

    @Column(name = "valor")
    private double valor;

    @Column(name = "origem")
    private Integer origem;


    public MovimentacoesR virarMovimentacoesR (){
        return new MovimentacoesR(this.id,this.data,this.tipo,this.clienteOrigemNome,this.clienteOrigemCpf,this.clienteDestinoNome,this.clienteDestinoCpf,this.valor, this.origem);
    }






}

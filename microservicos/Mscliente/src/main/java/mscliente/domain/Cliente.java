package mscliente.domain;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "cliente", schema = "dbcliente")
@Entity(name = "cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    private String cpf;

    private String nome;

    private String email;

    private double salario;

    private String endereco;

    private String cep;

    private String cidade;

    private String estado;

    @Column(length = 30) 
    private String status;

    @Column(name = "motivorejeite")
    private String motivoRejeite;

}

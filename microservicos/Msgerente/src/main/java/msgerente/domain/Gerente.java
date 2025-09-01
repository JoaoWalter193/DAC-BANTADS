package msgerente.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "gerente_adm",schema = "dbgerente")
@Entity(name = "gerente_adm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Gerente {


    @Id
    private String cpf;

    private String nome;

    private String email;

    private String senha;

    private String tipo;

}

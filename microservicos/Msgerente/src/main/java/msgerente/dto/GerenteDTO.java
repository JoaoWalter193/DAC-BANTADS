package msgerente.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import msgerente.domain.Gerente;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GerenteDTO {
    private String cpf;
    private String nome;
    private String email;
    private String tipo;

    public GerenteDTO(Gerente gerente) {
        this.cpf = gerente.getCpf();
        this.nome = gerente.getNome();
        this.email = gerente.getEmail();
        this.tipo = gerente.getTipo();
    }
}

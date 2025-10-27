package msauth.ms_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SagaRequest {
    private String sagaId;
    private String email;
    private String senha;
}

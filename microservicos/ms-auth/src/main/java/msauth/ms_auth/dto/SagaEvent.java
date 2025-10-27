package msauth.ms_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SagaEvent {
    private String sagaId;
    private String status; // auth_success / auth_fail
    private String payload;
}

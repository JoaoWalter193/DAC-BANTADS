package MSconta.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

public record MensagemDTO(String conta,
                          String destino,
                          double valor,
                          double saldo,
                          Instant data) {
    
}

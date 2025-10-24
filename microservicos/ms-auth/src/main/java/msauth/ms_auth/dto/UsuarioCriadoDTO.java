package msauth.ms_auth.dto;

import java.util.Set;

public record UsuarioCriadoDTO(
    String authUserId,
    String email,
    Set<String> roles
) {}


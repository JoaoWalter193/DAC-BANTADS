package msauth.ms_auth.dto;

public record LoginResponse(String access_token, String token_type, String tipo, UsuarioResponse usuario) {

}

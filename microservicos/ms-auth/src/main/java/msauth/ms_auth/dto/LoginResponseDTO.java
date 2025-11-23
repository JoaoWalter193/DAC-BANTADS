package msauth.ms_auth.dto; // Ajuste o pacote se necessário

import java.io.Serializable;

// Se usar Lombok:
// @Data
// @AllArgsConstructor
// @NoArgsConstructor
public class LoginResponseDTO implements Serializable {
    private String access_token;
    private String token_type;
    private UserDTO usuario;
    private String tipo;

    // Getters e Setters manuais (se não usar Lombok)
    public String getAccess_token() { return access_token; }
    public void setAccess_token(String access_token) { this.access_token = access_token; }
    
    public String getToken_type() { return token_type; }
    public void setToken_type(String token_type) { this.token_type = token_type; }
    
    public UserDTO getUsuario() { return usuario; }
    public void setUsuario(UserDTO usuario) { this.usuario = usuario; }
    
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}
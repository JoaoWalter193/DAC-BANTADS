package msauth.ms_auth.entities;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.Data;
import msauth.ms_auth.dto.LoginRequest;

@Data
@Document(collection = "usuario")
// implementar UserDetails é uma boa-prática
public class UsuarioEntity implements UserDetails {

    public enum StatusUsuario {
        PENDENTE, ATIVO, REJEITADO
    }

    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    private String password;
    private String cpf;
    private Set<Role> roles;
    private StatusUsuario status;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    public boolean isLoginCorrect(LoginRequest loginRequest, PasswordEncoder passwordEncoder) {
        return passwordEncoder.matches(loginRequest.password(), this.password);

    }
}

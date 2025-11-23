package msauth.ms_auth.config;

import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import msauth.ms_auth.entities.Role;
import msauth.ms_auth.entities.UsuarioEntity;
import msauth.ms_auth.repositories.UsuarioRepository;

@Configuration
public class AdminUserConfig implements CommandLineRunner {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserConfig(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder; 
    }

    private record UserSeedData(String email, String password, Role role) {}

    @Override
    @Transactional
    public void run(String... args) {
        List<UserSeedData> initialUsers = List.of(
            new UserSeedData("adm1@bantads.com.br", "tads", Role.ADMINISTRADOR),
            
            new UserSeedData("cli1@bantads.com.br", "tads", Role.CLIENTE),
            new UserSeedData("cli2@bantads.com.br", "tads", Role.CLIENTE),
            new UserSeedData("cli3@bantads.com.br", "tads", Role.CLIENTE),
            new UserSeedData("cli4@bantads.com.br", "tads", Role.CLIENTE),
            new UserSeedData("cli5@bantads.com.br", "tads", Role.CLIENTE),

            new UserSeedData("ger1@bantads.com.br", "tads", Role.GERENTE),
            new UserSeedData("ger2@bantads.com.br", "tads", Role.GERENTE),
            new UserSeedData("ger3@bantads.com.br", "tads", Role.GERENTE)
        );

        initialUsers.forEach(this::processarUsuario);
    }

    private void processarUsuario(UserSeedData data) {
        usuarioRepository.findByEmail(data.email()).ifPresentOrElse(
            existingUser -> {
                String novoHash = passwordEncoder.encode(data.password());
                
                if (!novoHash.equalsIgnoreCase(existingUser.getPassword())) {
                    existingUser.setPassword(novoHash);
                    existingUser.setRoles(Set.of(data.role()));
                    usuarioRepository.save(existingUser);
                    System.out.println("Usuário " + data.email() + " atualizado com hash SHA-256 (64 chars).");
                } else {
                    System.out.println("Usuário " + data.email() + " já está com os dados corretos.");
                }
            },
            () -> {
                // cria
                var newUser = new UsuarioEntity();
                newUser.setEmail(data.email());
                newUser.setPassword(passwordEncoder.encode(data.password()));
                newUser.setRoles(Set.of(data.role()));
                usuarioRepository.save(newUser);
                System.out.println("Usuário " + data.email() + " criado com sucesso.");
            }
        );
    }
}
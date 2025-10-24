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
    
    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;

    public AdminUserConfig(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder; 
    }

    // @Override
    // @Transactional
    // public void run(String... args) throws Exception {
    //         var userAdmin = usuarioRepository.findByEmail("admin@bantads.com");
    //         userAdmin.ifPresentOrElse(
    //             user -> { System.out.println("Email já cadastrado"); },
    //             () -> {
    //                 var user = new UsuarioEntity();
    //                 user.setEmail("admin@bantads.com");
    //                 user.setPassword(passwordEncoder.encode("123"));
    //                 user.setRoles(Set.of(Role.ADMINISTRADOR));
    //                 usuarioRepository.save(user);
    //             }
    //         );
    // }

    private UsuarioEntity createUser(String email, String password, Role role) {
        var user = new UsuarioEntity();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(role));
        return user;
    }

    private void verificarCadastroUsuario(UsuarioEntity user) {
        usuarioRepository.findByEmail(user.getEmail()).ifPresentOrElse(existingUser -> {
            System.out.println("Usuário com email " + existingUser.getEmail() + " já cadastrado.");
        },
        () -> {
            usuarioRepository.save(user);
            System.out.println("Usuário " + user.getEmail() + " cadastrado com sucesso.");
        }
        );
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<UsuarioEntity> initialUsers = List.of(
            createUser("adm1@bantads.com.br", "tads", Role.ADMINISTRADOR),
            
            createUser("cli1@bantads.com.br", "tads", Role.CLIENTE),
            createUser("cli2@bantads.com.br", "tads", Role.CLIENTE),
            createUser("cli3@bantads.com.br", "tads", Role.CLIENTE),
            createUser("cli4@bantads.com.br", "tads", Role.CLIENTE),
            createUser("cli5@bantads.com.br", "tads", Role.CLIENTE),

            createUser("ger1@bantads.com.br", "tads", Role.GERENTE),
            createUser("ger2@bantads.com.br", "tads", Role.GERENTE),
            createUser("ger3@bantads.com.br", "tads", Role.GERENTE)
        );
        // Itera sobre a lista e salva cada usuário se ele não existir
        initialUsers.forEach(this::verificarCadastroUsuario);
    }
    

}

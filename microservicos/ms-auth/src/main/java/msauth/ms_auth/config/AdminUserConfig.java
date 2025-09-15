package msauth.ms_auth.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import msauth.ms_auth.entities.Role;
import msauth.ms_auth.entities.UsuarioEntity;
import msauth.ms_auth.repositories.UsuarioRepository;

@Configuration
public class AdminUserConfig implements CommandLineRunner {


    private UsuarioRepository usuarioRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public AdminUserConfig(UsuarioRepository usuarioRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder; 
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
            var userAdmin = usuarioRepository.findByEmail("admin@bantads.com");
            userAdmin.ifPresentOrElse(
                user -> { System.out.println("Email já cadastrado"); },
                () -> {
                    var user = new UsuarioEntity();
                    user.setEmail("admin@bantads.com");
                    user.setPassword(bCryptPasswordEncoder.encode("123"));
                    user.setRoles(Set.of(Role.ADMINISTRADOR));
                    usuarioRepository.save(user);
                }
            );
    }
    

}

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

    private record UserSeedData(String email, String password, Role role, String cpf) {
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<UserSeedData> initialUsers = List.of(
                new UserSeedData("adm1@bantads.com.br", "tads", Role.ADMINISTRADOR, "40501740066"),

                new UserSeedData("cli1@bantads.com.br", "tads", Role.CLIENTE, "12912861012"),
                new UserSeedData("cli2@bantads.com.br", "tads", Role.CLIENTE, "09506382000"),
                new UserSeedData("cli3@bantads.com.br", "tads", Role.CLIENTE, "85733854057"),
                new UserSeedData("cli4@bantads.com.br", "tads", Role.CLIENTE, "58872160006"),
                new UserSeedData("cli5@bantads.com.br", "tads", Role.CLIENTE, "76179646090"),

                new UserSeedData("ger1@bantads.com.br", "tads", Role.GERENTE, "98574307084"),
                new UserSeedData("ger2@bantads.com.br", "tads", Role.GERENTE, "64065268052"),
                new UserSeedData("ger1@bantads.com.br", "tads", Role.GERENTE, "23862179060"));

        initialUsers.forEach(this::processarUsuario);
    }

    private void processarUsuario(UserSeedData data) {
        usuarioRepository.findByEmail(data.email()).ifPresentOrElse(
                existingUser -> {

                    if (!data.cpf().equals(existingUser.getCpf())) {
                        existingUser.setCpf(data.cpf());
                        usuarioRepository.save(existingUser);
                    }
                },
                () -> {

                    var newUser = new UsuarioEntity();
                    newUser.setEmail(data.email());
                    newUser.setPassword(passwordEncoder.encode(data.password()));
                    newUser.setRoles(Set.of(data.role()));
                    newUser.setCpf(data.cpf());
                    usuarioRepository.save(newUser);
                    System.out.println("Usuário " + data.email() + " criado com sucesso.");
                });
    }
}
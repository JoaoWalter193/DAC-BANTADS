package msauth.ms_auth.service;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import msauth.ms_auth.dto.SagaRequest;
import msauth.ms_auth.entities.Role;
import msauth.ms_auth.entities.UsuarioEntity;
import msauth.ms_auth.repositories.UsuarioRepository;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    public void criarAutenticacao(SagaRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        mailService.sendPasswordEmail(request.getEmail(),"Claudio",request.getSenha());

        String senhaHasheada = passwordEncoder.encode(request.getSenha());

        UsuarioEntity novoUsuario = new UsuarioEntity();
        novoUsuario.setEmail(request.getEmail());
        novoUsuario.setPassword(senhaHasheada);
        novoUsuario.setRoles(Set.of(Role.CLIENTE));
        
        usuarioRepository.save(novoUsuario);
    }
}

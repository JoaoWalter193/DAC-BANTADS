package msauth.ms_auth.service;

import msauth.ms_auth.dto.AprovacaoDTO;
import msauth.ms_auth.dto.AutocadastroDTO;
import msauth.ms_auth.dto.SagaRequest;
import msauth.ms_auth.entities.Role;
import msauth.ms_auth.entities.UsuarioEntity;
import msauth.ms_auth.entities.UsuarioEntity.StatusUsuario;
import msauth.ms_auth.repositories.UsuarioRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, MailService mailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    public AutocadastroDTO executarSagaCriacao(AutocadastroDTO saga) {
        try {
            if (usuarioRepository.findByEmail(saga.email()).isPresent()) {
                return saga.comErro("Email já cadastrado no sistema.");
            }

            UsuarioEntity novoUsuario = new UsuarioEntity();
            novoUsuario.setEmail(saga.email());
            novoUsuario.setCpf(saga.cpf());
            novoUsuario.setRoles(Set.of(Role.CLIENTE));
            novoUsuario.setStatus(StatusUsuario.PENDENTE);
            novoUsuario.setPassword(passwordEncoder.encode(RandomStringUtils.randomAlphanumeric(10)));
            
            novoUsuario = usuarioRepository.save(novoUsuario);

            return saga.comAuthCriado(novoUsuario.getId());

        } catch (Exception e) {
            LOGGER.error("Erro ao criar usuário na saga: {}", e.getMessage(), e);
            return saga.comErro("Erro no MS-Auth: " + e.getMessage());
        }
    }

    public void executarSagaRollback(AutocadastroDTO saga) {
        try {
            if (saga.idAuthCriado() != null) {
                usuarioRepository.deleteById(saga.idAuthCriado());
            } else {
                usuarioRepository.findByEmail(saga.email()).ifPresent(usuarioRepository::delete);
            }

            mailService.sendEmailErro(saga.email(), saga.nome());
            LOGGER.info("Rollback executado e email de erro enviado para: {}", saga.email());

        } catch (Exception e) {
            LOGGER.error("Erro crítico no rollback do Auth: {}", e.getMessage(), e);
        }
    }

    public void criarUsuarioAprovado(AprovacaoDTO saga) {
        if (saga.email() == null) {
            LOGGER.error("Erro: Email é obrigatório para criar usuário aprovado.");
            throw new IllegalArgumentException("Email é obrigatório");
        }

        if (usuarioRepository.findByEmail(saga.email()).isPresent()) {
            LOGGER.warn("Auth: Usuário {} já existe. Ignorando criação.", saga.email());
            return;
        }

        String senhaTemporaria = "tads" + UUID.randomUUID().toString().substring(0, 4);

        UsuarioEntity novoUsuario = new UsuarioEntity();
        novoUsuario.setEmail(saga.email());
        novoUsuario.setCpf(saga.cpf());
        novoUsuario.setPassword(passwordEncoder.encode(senhaTemporaria));
        novoUsuario.setRoles(Collections.singleton(Role.CLIENTE));
        novoUsuario.setStatus(StatusUsuario.ATIVO);

        usuarioRepository.save(novoUsuario);

        LOGGER.info("Usuário criado. Enviando e-mail com senha para: {}", saga.email());
        mailService.sendPasswordEmail(saga.email(), saga.nome(), senhaTemporaria);
    }
    
    
    public void criarAutenticacao(SagaRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        UsuarioEntity novoUsuario = new UsuarioEntity();
        novoUsuario.setEmail(request.getEmail());
        novoUsuario.setPassword(passwordEncoder.encode(request.getSenha()));
        novoUsuario.setRoles(Set.of(Role.CLIENTE));
        usuarioRepository.save(novoUsuario);
    }

    public void deletarAutenticacao(String email) {
        usuarioRepository.findByEmail(email).ifPresent(usuarioRepository::delete);
    }
}
package msauth.ms_auth.controllers;

import java.time.Instant;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimAccessor;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.RestController;

import msauth.ms_auth.dto.LoginRequest;
import msauth.ms_auth.dto.LoginResponse;
import msauth.ms_auth.dto.UsuarioResponse;
import msauth.ms_auth.entities.Role;
import msauth.ms_auth.entities.UsuarioEntity;
import msauth.ms_auth.repositories.UsuarioRepository;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class TokenController {
    private final JwtEncoder jwtEncoder;
    private final UsuarioRepository usuarioRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public TokenController(JwtEncoder jwtEncoder, UsuarioRepository usuarioRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.jwtEncoder = jwtEncoder;
        this.usuarioRepository = usuarioRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {

        UsuarioEntity user = usuarioRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new BadCredentialsException("Usuário ou senha inválidos."));

        if (!bCryptPasswordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new BadCredentialsException("Usuário ou senha inválidos.");
        }

        var now = Instant.now();
        var scopes = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        var claims = JwtClaimsSet.builder()
                        .issuer("mybackend")
                        .subject(user.getId())
                        .issuedAt(now)
                        .expiresAt(now.plusSeconds(3600L))
                        .claim("scope", scopes)
                        .build();

        var jwtValue = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        String roleUsuario = user.getRoles().stream()
                .findFirst()
                .map(Role::name)
                .orElse("INDEFINIDO");

        var usuarioResponse = new UsuarioResponse(user.getId(), user.getEmail());

        return ResponseEntity.ok(new LoginResponse(jwtValue, "Bearer", roleUsuario, usuarioResponse));
    }
    
}

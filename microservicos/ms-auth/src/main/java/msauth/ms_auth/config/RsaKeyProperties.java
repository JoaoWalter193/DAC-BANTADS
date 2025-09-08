package msauth.ms_auth.config;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record RsaKeyProperties(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
    
}

package msauth.ms_auth.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import msauth.ms_auth.entities.UsuarioEntity;

@Repository
public interface UsuarioRepository extends MongoRepository<UsuarioEntity, String> {
    UserDetails findByEmail(String email);
}
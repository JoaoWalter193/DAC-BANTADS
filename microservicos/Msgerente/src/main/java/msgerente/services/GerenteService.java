package msgerente.services;


import msgerente.domain.Gerente;
import msgerente.repositories.GerenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GerenteService {

    @Autowired
    GerenteRepository gerenteRepository;

    public ResponseEntity<List<Gerente>> listarGerentes() {
        List<Gerente> listaTemp = gerenteRepository.findAll();
        if (listaTemp.size() != 0 ){
            return ResponseEntity.ok(listaTemp);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(listaTemp);
        }
    }
}

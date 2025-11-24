package msSaga.msSaga.services;


import jakarta.validation.Valid;
import msSaga.msSaga.DTO.*;
import msSaga.msSaga.consumer.RabbitMQConsumer;
import msSaga.msSaga.producer.RabbitMQProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class SagaService {


    @Autowired
    RabbitMQProducer rabbitMQProducer;

    @Autowired
    RabbitMQConsumer rabbitMQConsumer;

    public ResponseEntity<testeProfessorDTO> autoCadastro (AutocadastroDTO data){
        /*

        1 PASSO - Criar cadastro do cliente em Ms-cliente --> Está enviando, agora preciso ver como faço para a lógica ficar aqui e passar para o prox passo
        2 PASSO - Criar cadastro do cliente em Ms-auth
        3 PASSO - Criar a origem do cliente em Ms-origem
        4 PASSO - Alocar origem do cliente para um gerente
        -- em teoria acaba aqui esta saga, pois a partir disso fica a questão de quando o gerente irá aprovar o cliente

        5 PASSO - Gerente aprovou = Enviar senha aleatoria para o cliente por email
                  Gerente negou = Colcoar motivo e data e hora e enviar por email para o cliente e armazenar


        OBS: Se ocorrer alguma fala deve ser enviado para o cliente indiando que a solicitação não foi efetuada
         */

        //Enviar os dados necesśarios para criar o cliente

        rabbitMQProducer.sendContaCliente(data);
        // a partir disso ele vai receber a mensagem no Consumer e a lógica vai rodar de lá
        // --> Tenho que perguntar para o professor e pessoas, como fizeram para a lógica continuar aqui


        //Agora tem de enviar os dados para o ms-auth

        //Depois do ms-auth tem que enviar para o ms-origem
        return ResponseEntity.status(HttpStatus.CREATED).body(new testeProfessorDTO(data.cpf(),
                data.email()));

    }

    public ResponseEntity<String> sagaAprovarCliente(String cpf){


        AutocadastroDTO data = new AutocadastroDTO(cpf,"Aprovar Conta",
                null, 1.2,
                null, null,
                null, null);
        rabbitMQProducer.sendContaCliente(data);

        return ResponseEntity.ok("Cliente aprovado com sucesso");
    }

    // PEGAR OS DADOS AQUI É UMA BUCHA, DEPOIS O API GATEWAY FAZ A PESQUISA DOS DADOS COM O GET E FAZ O QUE FOR NECESSÁRIO PARA MONTAR A RESPOSTA


    public ResponseEntity<RespostaPadraoDTO> removerGerente(String cpf) {
        //MS-Gerentes -> CPF
        //MS-Conta -> CPF

        GerenteMsDTO dtoTemp = new GerenteMsDTO(cpf, null,null,null,null, "Deletar");
        rabbitMQProducer.sendGerenteMsGerente(dtoTemp);

        return ResponseEntity.ok(new RespostaPadraoDTO("Development", 500));
    }

    public ResponseEntity<RespostaPadraoDTO> atualizarGerente(String cpf, @Valid GerenteAttDTO data) {

        //MS-Gerentes -> (Nome, Email, Senha)
        //MS-Conta -> (Nome)

        GerenteMsDTO dtoTemp = new GerenteMsDTO(cpf, data.nome(), data.email(), null, data.senha(),"Atualizar");
        rabbitMQProducer.sendGerenteMsGerente(dtoTemp);

        return ResponseEntity.ok(new RespostaPadraoDTO("Development", 500));
    }

    public ResponseEntity<RespostaPadraoDTO> inserirGerente(@Valid GerenteMsDTO data) {

        // MS-Gerentes -> Todos os Dados (Cpf, Nome, Email, Senha, Tipo)
        // MS-Conta -> (Cpf, Nome)

        GerenteMsDTO dtoTemp = new GerenteMsDTO(data.cpf(), data.nome(), data.email(), data.tipo(), data.senha(), "Criar");
        rabbitMQProducer.sendGerenteMsGerente(dtoTemp);

        return ResponseEntity.status(HttpStatus.CREATED).body(new RespostaPadraoDTO("Gerente criado", 201));
    }

// teste pedro alteracaoperfil
    public void executarSagaAlteracaoPerfil(AlteracaoPerfilDTO dados) {
        System.out.println("saga service - recebe HTTP Req");
        
        rabbitMQProducer.sendAtualizarCliente(dados);
    }
}

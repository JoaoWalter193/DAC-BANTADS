package msSaga.msSaga.services;


import msSaga.msSaga.DTO.AutocadastroDTO;
import msSaga.msSaga.DTO.RespostaPadraoDTO;
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

    public ResponseEntity<RespostaPadraoDTO> autoCadastro (AutocadastroDTO data){
        /*

        1 PASSO - Criar cadastro do cliente em Ms-cliente --> Está enviando, agora preciso ver como faço para a lógica ficar aqui e passar para o prox passo
        2 PASSO - Criar cadastro do cliente em Ms-auth
        3 PASSO - Criar a conta do cliente em Ms-conta
        4 PASSO - Alocar conta do cliente para um gerente
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

        //Depois do ms-auth tem que enviar para o ms-conta

        return ResponseEntity.ok(new RespostaPadraoDTO("Processo de autocadastro iniciado, mais informações serão enviadas via e-mail", HttpStatus.CREATED.value()));

    }

}

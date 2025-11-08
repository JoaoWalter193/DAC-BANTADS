package msSaga.msSaga.consumer;



import msSaga.msSaga.DTO.AlteracaoPerfilDTO;
import msSaga.msSaga.DTO.ClienteDTO;
import msSaga.msSaga.DTO.ResponseDTO;
import msSaga.msSaga.producer.RabbitMQProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {

    @Autowired
    RabbitMQProducer rabbitMQProducer;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = {"MsSaga"})
    public void consume(ResponseDTO message){
        // A mensagem que eu vou receber aqui não vai ser só uma string, vai ser uma msg com todos os dados do cliente e um cmapo de resposta
        // e os if's serão baseados nesse campo


        if (message.cod() == 201 && message.ms().equals("msCliente")){
            System.out.println(">>> PROCESSANDO: msCliente - Criar conta");

            // lógica após adicionar cliente em Cliente
            // VOU FAZER MOMENTANEAMENTE A LÓGICA DE ENVIAR DIRETO PARA CONTA MAS DEPOIS AQUI TEM QUE SER ONDE ENVIA O MS-AUTH E RECEBENDO DO AUTH ELE ENVIA PRA CONTA
            ResponseDTO respostaTemp = new ResponseDTO(00, message.cpf(),
                    message.nome(),
                    message.salario(),
                    "Criar conta");
            rabbitMQProducer.sendContaConta(respostaTemp);

        }



        // LÓGICA PARA EXCLUIR / ADICIONAR GERENTE NO MS-CONTA
        // adicionar gerente
        if (message.cod() == 201 && message.ms().equals("msGerente-criar")){
            rabbitMQProducer.sendGerenteExcluirAdd(message);

        }

        // remover gerente
        if (message.cod() == 200 && message.ms().equals("msGerente-deletar")){
            rabbitMQProducer.sendGerenteExcluirAdd(message);

        }

        // atualizar gerente
        if (message.cod() == 200 && message.ms().equals("msGerente-atualizar")){
            rabbitMQProducer.sendGerenteExcluirAdd(message);
        }


        // LÓGICA PARA APROVAÇÃO DA CONTA DO CLIENTE
        if (message.cod() == 200 && message.ms().equals("msCliente-aprovado")){
            rabbitMQProducer.sendContaConta(message);
        }

    }

// teste pedro alteracaoperfil
    @RabbitListener(queues = {"AtualizacaoClienteSucesso"})
    public void clienteAtualizadoSucesso(AlteracaoPerfilDTO dados) {
        System.out.println("cliente->saga teste recebe evento alteracao ");
        
        try {
            System.out.println("saga->conta teste clienteAtualizadoSucesso saga consumer.");

            // envia o comando pra atualizar limite
            rabbitMQProducer.sendAtualizarLimite(dados);
            
        } catch (Exception e) {
            System.out.println("saga consumer -> ERRO");
            rabbitMQProducer.sendAtualizarFalha(dados.dadosOriginais());
        }
    }
    
    // ouve a fila de sucesso pra confirmar que funcionou
    @RabbitListener(queues = {"AtualizacaoContaSucesso"})
    public void contaAtualizadaSucesso(AlteracaoPerfilDTO dados) { 
        System.out.println("conta->saga teste confirmacao sucesso");
    }
//listener pra falha
    @RabbitListener(queues = {"AtualizacaoContaFalha"})
    public void contaAtualizadaFalha(AlteracaoPerfilDTO dados) {
        System.out.println("saga consumer -> erro AtualizacaoContaFalha");
        
        try {
            System.out.println("saga consumer -> reverter cliente");
            
            ClienteDTO dadosClienteOriginais = dados.dadosOriginais();            
            rabbitMQProducer.sendAtualizarFalha(dadosClienteOriginais);
            
        } catch (Exception e) {
            System.out.println("saga consumer -> falha reversao.");
        }
    }
}

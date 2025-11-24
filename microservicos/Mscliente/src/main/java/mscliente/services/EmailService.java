package mscliente.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

        @Autowired
        private JavaMailSender mailSender;

        public void sendPasswordEmail(String toEmail, String nome, String senha) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("dindintads@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Bem-vindo ao DinDin - Sua senha de acesso");

            String emailContent = String.format(
                    "Olá %s,\n\n" +
                            "Agradecemos por se cadastrar em nosso sistema!\n\n" +
                            "Aqui está a sua senha de acesso: %s\n\n" +
                            "Atenciosamente,\n" +
                            "Equipe DinDin", nome, senha);

            message.setText(emailContent);

            mailSender.send(message);
        }

    public void sendRejeicao(String toEmail, String nome, String motivo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("dindintads@gmail.com");
        message.setTo(toEmail);
        message.setSubject("DinDin - Cadastro Negado");

        String emailContent = String.format(
                "Olá %s,\n\n" +
                        "Agradecemos por se realizar o cadastro em nosso sistema!\n\n" +
                        "Infelizmente sua origem foi negada devido: %s\n\n" +
                        "Atenciosamente,\n" +
                        "Equipe DinDin", nome, motivo);

        message.setText(emailContent);

        mailSender.send(message);
    }

    public void sendEmailErro(String toEmail, String nome) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("dindintads@gmail.com");
        message.setTo(toEmail);
        message.setSubject("DinDin - Erro no processamento de origem");

        String emailContent = String.format(
                "Olá %s,\n\n" +
                "A equipe do DinDin sente em informar que houve um erro no cadstro de sua origem, para mais informações, retorne este email\n\n" +
                "Agradecimentos, DinDin", nome);

        message.setText(emailContent);

        mailSender.send(message);
    }


}

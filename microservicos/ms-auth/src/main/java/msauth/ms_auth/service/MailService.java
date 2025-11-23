package msauth.ms_auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    // Pega o email do remetente do properties ou fixa aqui
    @Value("${spring.mail.username}")
    private String remetente;

    public void sendPasswordEmail(String toEmail, String nome, String senha) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
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
            System.out.println("Email de senha enviado para: " + toEmail);
        } catch (Exception e) {
            System.err.println("Falha ao enviar email de senha: " + e.getMessage());
        }
    }

    public void sendRejeicao(String toEmail, String nome, String motivo) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(toEmail);
            message.setSubject("DinDin - Cadastro Negado");

            String emailContent = String.format(
                    "Olá %s,\n\n" +
                            "Agradecemos por realizar o cadastro em nosso sistema!\n\n" +
                            "Infelizmente sua conta foi negada devido: %s\n\n" +
                            "Atenciosamente,\n" +
                            "Equipe DinDin", nome, motivo);

            message.setText(emailContent);
            mailSender.send(message);
            System.out.println("Email de rejeição enviado para: " + toEmail);
        } catch (Exception e) {
            System.err.println("Falha ao enviar email de rejeição: " + e.getMessage());
        }
    }

    public void sendEmailErro(String toEmail, String nome) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(toEmail);
            message.setSubject("DinDin - Erro no processamento de conta");

            String emailContent = String.format(
                    "Olá %s,\n\n" +
                            "A equipe do DinDin sente em informar que houve um erro no cadastro de sua conta, para mais informações, retorne este email\n\n" +
                            "Agradecimentos, DinDin", nome);

            message.setText(emailContent);
            mailSender.send(message);
            System.out.println("Email de erro enviado para: " + toEmail);
        } catch (Exception e) {
            System.err.println("Falha ao enviar email de erro: " + e.getMessage());
        }
    }
}
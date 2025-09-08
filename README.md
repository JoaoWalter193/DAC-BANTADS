<h1>BANTADS</h1>

Para rodar este projeto é necessário alguns softwares:
- Git
- Docker-compose

<h2>Passo a Passo para rodar o projeto</h2>

- Clonar repositório
- Entrar na pasta inicial do repositório(onde tem o compose.yaml)
- Execuar o comando `docker-compose up`
    - Alguns comandos extras úteis:
    - `docker-compose up -d` > Rodar os containers sem ocupar o terminal
    - `docker-compose down` > Desligar os containers
    - `docker-compose down -v` > Desligar os containers e apagar eles
- Prontinho :D agora pode testar entrando no local host


 <h2>PORTAS</h2>
 Nosso projeto tem muitas e MUITAS aplicações rodando dentro da nossa máquina, aqui vai ficar a gerência de todas as portas e serviços rodando nelas respectivamente:


 - 80 : Front-end
 - 3000 : APIGateway
 - 8081 : ms-gerente
 - 8082 : ms-auth
 - 8083 : ms-cliente
 - 5432 : PostgreSQL
 - 27017 : MongoDB
 - 12345 : Adminer(Gerenciador Web de SQL)
 - 1010: microserviço de gerente


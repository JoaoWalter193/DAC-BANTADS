CREATE USER dbCliente WITH PASSWORD 'dbCliente';
CREATE USER dbGerente WITH PASSWORD 'dbGerente';
CREATE USER dbConta WITH PASSWORD 'dbContaCUD';
-- Criacao dos schemas para o shcema per service

create SCHEMA dbContaR;
CREATE SCHEMA dbContaCUD;

CREATE SCHEMA dbCliente;
CREATE SCHEMA dbGerente; 


-- Privilegios dos usuários de acordo com cada schemas

GRANT USAGE ON SCHEMA dbCliente TO dbCliente;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dbCliente TO dbCliente;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbCliente GRANT ALL PRIVILEGES ON TABLES TO dbCliente;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbCliente GRANT ALL PRIVILEGES ON SEQUENCES TO dbCliente;


GRANT USAGE ON SCHEMA dbGerente TO dbGerente;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dbGerente TO dbGerente;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbGerente GRANT ALL PRIVILEGES ON TABLES TO dbGerente;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbGerente GRANT ALL PRIVILEGES ON SEQUENCES TO dbGerente;



GRANT USAGE ON SCHEMA dbContaR TO dbConta;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dbContaR TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbContaR GRANT SELECT ON TABLES TO dbConta;


GRANT USAGE ON SCHEMA dbContaCUD TO dbConta;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dbContaCUD TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbContaCUD GRANT ALL PRIVILEGES ON TABLES TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbContaCUD GRANT ALL PRIVILEGES ON SEQUENCES TO dbConta;


-- Cricao de tabelas em cada schema 

-- Schema Cliente 

CREATE TABLE dbcliente.cliente (
cpf VARCHAR(11) PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
senha TEXT NOT NULL,
salario DECIMAL(7,2) NOT NULL,
endereco VARCHAR(100) NOT NULL
);

-- Schema ContaCUD

CREATE TABLE dbContaCUD.conta(
cpfCliente VARCHAR(11),
nomeCliente VARCHAR(100),
numConta VARCHAR(4),
saldo DECIMAL(8,2),
cpfGerente VARCHAR(11),
nomeGerente VARCHAR(100),
dataCriacao DATE
);

CREATE TABLE dbContaCUD.movimentacao (
dataHora TIMESTAMP,
tipo VARCHAR(15),
clienteOrigemNome VARCHAR(100),
clienteOrigemCpf VARCHAR(11),
clienteDestinoNome VARCHAR(100),
clienteDestinoCpf VARCHAR(100),
valor DECIMAL(8,2)
);

-- Schema ContaR

CREATE TABLE dbContaR.conta(
cpfCliente VARCHAR(11),
nomeCliente VARCHAR(100),
numConta VARCHAR(4),
saldo DECIMAL(8,2),
cpfGerente VARCHAR(11),
nomeGerente VARCHAR(100),
dataCriacao DATE
);

CREATE TABLE dbContaR.movimentacao (
dataHora TIMESTAMP,
tipo VARCHAR(15),
clienteOrigemNome VARCHAR(100),
clienteOrigemCpf VARCHAR(11),
clienteDestinoNome VARCHAR(100),
clienteDestinoCpf VARCHAR(100),
valor DECIMAL(8,2)
);


-- Schema gerente 
CREATE TABLE dbGerente.gerente_adm(
cpf VARCHAR(11) PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
senha TEXT NOT NULL,
tipo VARCHAR(15)
);



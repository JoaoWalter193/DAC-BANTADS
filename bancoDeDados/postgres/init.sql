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


GRANT USAGE ON SCHEMA dbcontar TO dbConta;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dbcontar TO dbConta;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dbcontar TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbcontar GRANT ALL PRIVILEGES ON TABLES TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbcontar GRANT USAGE, SELECT ON SEQUENCES TO dbConta;

GRANT USAGE ON SCHEMA dbcontacud TO dbConta;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dbcontacud TO dbConta;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dbcontacud TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbcontacud GRANT ALL PRIVILEGES ON TABLES TO dbConta;
ALTER DEFAULT PRIVILEGES IN SCHEMA dbcontacud GRANT USAGE, SELECT ON SEQUENCES TO dbConta;


-- Cricao de tabelas em cada schema 

-- Schema Cliente 

CREATE TABLE dbcliente.cliente (
cpf VARCHAR(11) PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
senha TEXT NOT NULL,
salario DECIMAL(7,2) NOT NULL,
endereco VARCHAR(100) NOT NULL,
cep VARCHAR(8) NOT NULL,
cidade VARCHAR(100) NOT NULL,
estado VARCHAR(100) NOT NULL,
status VARCHAR (10) NOT NULL,  -- APROVADO / REJEITADO / ESPERANDO
motivoRejeite TEXT
);

-- Schema ContaCUD

CREATE TABLE dbContaCUD.conta(
numConta SERIAL PRIMARY KEY,
cpfCliente VARCHAR(11),
nomeCliente VARCHAR(100),
saldo DECIMAL(8,2),
limite DECIMAL(8,2),
cpfGerente VARCHAR(11),
nomeGerente VARCHAR(100),
dataCriacao DATE,
ativa BOOLEAN
);

CREATE TABLE dbContaCUD.movimentacao (
id SERIAL PRIMARY KEY,
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
numConta SERIAL PRIMARY KEY,
cpfCliente VARCHAR(11),
nomeCliente VARCHAR(100),
saldo DECIMAL(8,2),
limite DECIMAL (8,2),
cpfGerente VARCHAR(11),
nomeGerente VARCHAR(100),
dataCriacao DATE,
ativa BOOLEAN
);

CREATE TABLE dbContaR.movimentacao (
id SERIAL PRIMARY KEY,
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

-- Inserções
INSERT INTO dbcliente.cliente (cpf, nome, email, senha, salario, endereco, cep, cidade, estado, status) VALUES
('12912861012', 'Catharyna', 'cli1@bantads.com.br', 'tads', 10000.00, 'Rua das Flores, 123', '88010000', 'Florianópolis', 'SC', 'APROVADO'),
('09506382000', 'Cleuddônio', 'cli2@bantads.com.br', 'tads', 20000.00, 'Av. Principal, 456', '88020000', 'São José', 'SC', 'APROVADO'),
('85733854057', 'Catianna', 'cli3@bantads.com.br', 'tads', 3000.00, 'Praça Central, 789', '88030000', 'Palhoça', 'SC', 'APROVADO'),
('58872160006', 'Cutardo', 'cli4@bantads.com.br', 'tads', 500.00, 'Travessa Secundária, 101', '88040000', 'Biguaçu', 'SC', 'APROVADO'),
('76179646090', 'Coândrya', 'cli5@bantads.com.br', 'tads', 1500.00, 'Alameda dos Anjos, 202', '88050000', 'Águas Mornas', 'SC', 'APROVADO');

INSERT INTO dbContaCUD.conta (cpfCliente, nomeCliente, numConta, saldo, limite, cpfGerente, nomeGerente, dataCriacao, ativa) VALUES
('12912861012', 'Catharyna', 1291, 800.00, 5000.00, '98574307084', 'Geniéve', '2000-01-01', true),
('09506382000', 'Cleuddônio', 950, -10000.00, 10000.00, '64065268052', 'Godophredo', '1990-10-10', true),
('85733854057', 'Catianna', 8573, -1000.00, 1500.00, '23862179060', 'Gyândula', '2012-12-12', true),
('58872160006', 'Cutardo', 5887, 150000.00, 250.00, '98574307084', 'Geniéve', '2022-02-22', true),
('76179646090', 'Coândrya', 7617, 1500.00, 750.00, '64065268052', 'Godophredo', '2025-01-01', true);

INSERT INTO dbContaR.conta (cpfCliente, nomeCliente, numConta, saldo, limite, cpfGerente, nomeGerente, dataCriacao, ativa) VALUES
('12912861012', 'Catharyna', 1291, 800.00, 5000.00, '98574307084', 'Geniéve', '2000-01-01',true),
('09506382000', 'Cleuddônio', 950, -10000.00, 10000.00, '64065268052', 'Godophredo', '1990-10-10',true),
('85733854057', 'Catianna', 8573, -1000.00, 1500.00, '23862179060', 'Gyândula', '2012-12-12',true),
('58872160006', 'Cutardo', 5887, 150000.00, 250.00, '98574307084', 'Geniéve', '2022-02-22',true),
('76179646090', 'Coândrya', 7617, 1500.00, 750.00, '64065268052', 'Godophredo', '2025-01-01',true);

INSERT INTO dbContaCUD.movimentacao (dataHora, tipo, clienteOrigemNome, clienteOrigemCpf, clienteDestinoNome, clienteDestinoCpf, valor) VALUES
('2020-01-01 10:00:00', 'depósito', 'Catharyna', '12912861012', NULL, NULL, 1000.00),
('2020-01-01 11:00:00', 'depósito', 'Catharyna', '12912861012', NULL, NULL, 900.00),
('2020-01-01 12:00:00', 'saque', 'Catharyna', '12912861012', NULL, NULL, 550.00),
('2020-01-01 13:00:00', 'saque', 'Catharyna', '12912861012', NULL, NULL, 350.00),
('2020-01-10 15:00:00', 'depósito', 'Catharyna', '12912861012', NULL, NULL, 2000.00),
('2020-01-15 08:00:00', 'saque', 'Catharyna', '12912861012', NULL, NULL, 500.00),
('2020-01-20 12:00:00', 'transferência', 'Catharyna', '12912861012', 'Cleuddônio', '09506382000', 1700.00),
('2025-01-01 12:00:00', 'depósito', 'Cleuddônio', '09506382000', NULL, NULL, 1000.00),
('2025-01-02 10:00:00', 'depósito', 'Cleuddônio', '09506382000', NULL, NULL, 5000.00),
('2025-01-10 10:00:00', 'saque', 'Cleuddônio', '09506382000', NULL, NULL, 200.00),
('2025-02-05 10:00:00', 'depósito', 'Cleuddônio', '09506382000', NULL, NULL, 7000.00),
('2025-05-05 00:00:00', 'depósito', 'Catianna', '85733854057', NULL, NULL, 1000.00),
('2025-05-06 00:00:00', 'saque', 'Catianna', '85733854057', NULL, NULL, 2000.00),
('2025-06-01 00:00:00', 'depósito', 'Cutardo', '58872160006', NULL, NULL, 150000.00),
('2025-07-01 00:00:00', 'depósito', 'Coândrya', '76179646090', NULL, NULL, 1500.00);

INSERT INTO dbContaR.movimentacao (dataHora, tipo, clienteOrigemNome, clienteOrigemCpf, clienteDestinoNome, clienteDestinoCpf, valor) VALUES
('2020-01-01 10:00:00', 'depósito', 'Catharyna', '12912861012', NULL, NULL, 1000.00),
('2020-01-01 11:00:00', 'depósito', 'Catharyna', '12912861012', NULL, NULL, 900.00),
('2020-01-01 12:00:00', 'saque', 'Catharyna', '12912861012', NULL, NULL, 550.00),
('2020-01-01 13:00:00', 'saque', 'Catharyna', '12912861012', NULL, NULL, 350.00),
('2020-01-10 15:00:00', 'depósito', 'Catharyna', '12912861012', NULL, NULL, 2000.00),
('2020-01-15 08:00:00', 'saque', 'Catharyna', '12912861012', NULL, NULL, 500.00),
('2020-01-20 12:00:00', 'transferência', 'Catharyna', '12912861012', 'Cleuddônio', '09506382000', 1700.00),
('2025-01-01 12:00:00', 'depósito', 'Cleuddônio', '09506382000', NULL, NULL, 1000.00),
('2025-01-02 10:00:00', 'depósito', 'Cleuddônio', '09506382000', NULL, NULL, 5000.00),
('2025-01-10 10:00:00', 'saque', 'Cleuddônio', '09506382000', NULL, NULL, 200.00),
('2025-02-05 10:00:00', 'depósito', 'Cleuddônio', '09506382000', NULL, NULL, 7000.00),
('2025-05-05 00:00:00', 'depósito', 'Catianna', '85733854057', NULL, NULL, 1000.00),
('2025-05-06 00:00:00', 'saque', 'Catianna', '85733854057', NULL, NULL, 2000.00),
('2025-06-01 00:00:00', 'depósito', 'Cutardo', '58872160006', NULL, NULL, 150000.00),
('2025-07-01 00:00:00', 'depósito', 'Coândrya', '76179646090', NULL, NULL, 1500.00);

INSERT INTO dbGerente.gerente_adm (cpf, nome, email, senha, tipo) VALUES
('98574307084', 'Geniéve', 'ger1@bantads.com.br', 'tads', 'GERENTE'),
('64065268052', 'Godophredo', 'ger2@bantads.com.br', 'tads', 'GERENTE'),
('23862179060', 'Gyândula', 'ger3@bantads.com.br', 'tads', 'GERENTE'),
('40501740066', 'Adamântio', 'adm1@bantads.com.br', 'tads', 'administrador');

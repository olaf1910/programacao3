DROP TABLE IF EXISTS Tarefas_Atribuicoes, Tarefas, Competencias_Utilizadores, Competencias, Utilizadores, Funcoes;

CREATE TABLE Funcoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome ENUM('admin', 'gerente', 'lider_equipa', 'programador') NOT NULL UNIQUE
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
INSERT INTO Funcoes (nome) VALUES ('admin'), ('gerente'), ('lider_equipa'), ('programador');

CREATE TABLE Utilizadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_utilizador VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    funcao_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcao_id) REFERENCES Funcoes(id) ON DELETE RESTRICT
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
CREATE INDEX idx_nome ON Utilizadores(nome_utilizador);
INSERT INTO Utilizadores (nome_utilizador, password_hash, email, funcao_id) VALUES
('admin_user', '$2a$12$0.6UjFsJ7gGtWEBzsUqAv.9iGL5mm8hZEdJ50HHQi2/MHrAR4sjgS', 'admin@exemplo.com', 1);

CREATE TABLE Competencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE Competencias_Utilizadores (
    utilizador_id INT,
    competencia_id INT,
    PRIMARY KEY (utilizador_id, competencia_id),
    FOREIGN KEY (utilizador_id) REFERENCES Utilizadores(id) ON DELETE CASCADE,
    FOREIGN KEY (competencia_id) REFERENCES Competencias(id) ON DELETE CASCADE
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE Tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL,
    criado_por INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('nao_atribuida', 'atribuida', 'em_progresso', 'concluida') DEFAULT 'nao_atribuida',
    FOREIGN KEY (criado_por) REFERENCES Utilizadores(id) ON DELETE RESTRICT
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE Tarefas_Atribuicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarefa_id INT NOT NULL,
    atribuido_a INT NOT NULL,
    atribuido_por INT NOT NULL,
    inicio DATETIME,
    fim DATETIME,
    FOREIGN KEY (tarefa_id) REFERENCES Tarefas(id) ON DELETE RESTRICT,
    FOREIGN KEY (atribuido_a) REFERENCES Utilizadores(id) ON DELETE RESTRICT,
    FOREIGN KEY (atribuido_por) REFERENCES Utilizadores(id) ON DELETE RESTRICT
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
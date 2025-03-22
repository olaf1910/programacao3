-- Drop existing tables if they exist (optional, to start fresh)
DROP TABLE IF EXISTS Job_Assignments, Jobs, User_Skills, Skills, Users, Roles;

-- 1. Roles Table
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('admin', 'manager', 'team_leader', 'programmer') NOT NULL UNIQUE
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE RESTRICT
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_username ON Users(username);

-- 3. Skills Table
CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 4. User_Skills Table
CREATE TABLE User_Skills (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 5. Jobs Table
CREATE TABLE Jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('unassigned', 'assigned', 'completed') DEFAULT 'unassigned',
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE RESTRICT
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 6. Job_Assignments Table
CREATE TABLE Job_Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    assigned_to INT NOT NULL,
    assigned_by INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES Users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by) REFERENCES Users(user_id) ON DELETE RESTRICT
)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Insert initial data to test the database
-- Insert roles
INSERT INTO Roles (role_name) VALUES ('admin'), ('manager'), ('team_leader'), ('programmer');

-- Insert sample users with Portuguese-friendly characters
INSERT INTO Users (username, password_hash, email, role_id) VALUES
('admin_user', 'hashed_password_placeholder', 'admin@exemplo.com', 1),
('gerente1', 'hashed_password_placeholder', 'gerente1@exemplo.com', 2),
('líder_equipa1', 'hashed_password_placeholder', 'lider1@exemplo.com', 3),
('programador1', 'hashed_password_placeholder', 'programador1@exemplo.com', 4);

-- Insert sample skills with Portuguese terms
INSERT INTO Skills (skill_name) VALUES ('Java'), ('Python'), ('Desenvolvimento Web');

-- Insert user skills for programmer1
INSERT INTO User_Skills (user_id, skill_id) VALUES (4, 1), (4, 3);

-- Insert a sample job by gerente1 with Portuguese description
INSERT INTO Jobs (description, created_by) VALUES ('Desenvolver um módulo de autenticação', 2);

-- Assign the job to programador1 by líder_equipa1
INSERT INTO Job_Assignments (job_id, assigned_to, assigned_by) VALUES (1, 4, 3);
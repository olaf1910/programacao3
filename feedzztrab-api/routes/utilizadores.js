const express = require('express');
const router = express.Router();
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Funcoes = require('../config/funcoes');
const { PASSWORD_REGEX } = require('../config/validations');

router.post('/', autenticar, verificarFuncao([Funcoes.ADMIN]), async (req, res) => {
    const { nome_utilizador, palavra_passe, email, funcao } = req.body;

    // Validação de nome_utilizador
    if (!nome_utilizador || nome_utilizador.trim() === '') {
        return res.status(400).json({ mensagem: 'O nome de utilizador não pode ser nulo ou vazio' });
    }

    // Validação de palavra_passe
    if (!palavra_passe || !PASSWORD_REGEX.test(palavra_passe)) {
        return res.status(400).json({ 
            mensagem: 'A palavra-passe deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um carácter especial (@$!%*?&)' 
        });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ mensagem: 'O email fornecido não é válido' });
    }

    // Validação de funcao contra o enum Funcoes
    const funcoesValidas = Object.values(Funcoes);
    if (!funcao || !funcoesValidas.includes(funcao)) {
        return res.status(400).json({ 
            mensagem: `A função deve ser uma das seguintes: ${funcoesValidas.join(', ')}` 
        });
    }

    try {
        const palavraPasseHash = await bcrypt.hash(palavra_passe, 10);
        const [resultado] = await conexao.query(
            'INSERT INTO Utilizadores (nome_utilizador, password_hash, email, funcao_id) VALUES (?, ?, ?, (SELECT id FROM Funcoes WHERE nome = ?))',
            [nome_utilizador, palavraPasseHash, email, funcao]
        );
        const utilizador = { id: resultado.insertId, nome_utilizador, email, funcao };
        res.status(201).json(utilizador);
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_DUP_ENTRY':
                mensagem = 'Nome de utilizador ou email já existe';
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                mensagem = 'Função especificada não existe';
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_BAD_NULL_ERROR':
                mensagem = 'Os dados fornecidos não são válidos';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    const { nome_utilizador, palavra_passe } = req.body;
    try {
        const [utilizadores] = await conexao.query(
            'SELECT u.id, u.nome_utilizador, u.password_hash, r.nome as funcao_nome ' +
            'FROM Utilizadores u ' +
            'JOIN Funcoes r ON u.funcao_id = r.id ' +
            'WHERE u.nome_utilizador = ?',
            [nome_utilizador]
        );
        const utilizador = utilizadores[0];
        if (!utilizador || !(await bcrypt.compare(palavra_passe, utilizador.password_hash))) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { utilizador_id: utilizador.id, funcao: utilizador.funcao_nome },
            process.env.JWT_SECRET
        );
        res.json({ token });
    } catch (erro) {
        console.error(erro);
        let mensagem;
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados';
                break;
            case 'ER_BAD_NULL_ERROR':
                mensagem = 'Os dados fornecidos não são válidos';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

// Rota para alterar palavra-passe
router.patch('/:utilizador_id/palavra_passe', autenticar, async (req, res) => {
    const { utilizador_id } = req.params;
    const { palavra_passe_atual, nova_palavra_passe } = req.body;

    if (req.utilizador.utilizador_id != utilizador_id) {
        return res.status(403).json({ mensagem: 'Proibido: apenas o próprio utilizador pode alterar a sua palavra-passe' });
    }

    // Validação de nova_palavra_passe
    if (!nova_palavra_passe || !PASSWORD_REGEX.test(nova_palavra_passe)) {
        return res.status(400).json({ 
            mensagem: 'A nova palavra-passe deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um carácter especial (@$!%*?&)' 
        });
    }

    try {
        const [utilizadores] = await conexao.query('SELECT * FROM Utilizadores WHERE id = ?', [utilizador_id]);
        const utilizador = utilizadores[0];
        if (!utilizador) return res.status(404).json({ mensagem: 'Utilizador não encontrado' });

        const palavraPasseCorreta = await bcrypt.compare(palavra_passe_atual, utilizador.password_hash);
        if (!palavraPasseCorreta) {
            return res.status(400).json({ mensagem: 'Palavra-passe atual incorreta' });
        }

        const novaPalavraPasseHash = await bcrypt.hash(nova_palavra_passe, 10);
        await conexao.query('UPDATE Utilizadores SET password_hash = ? WHERE id = ?', [novaPalavraPasseHash, utilizador_id]);

        res.status(200).json({ mensagem: 'Palavra-passe alterada com sucesso' });
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados';
                break;
            case 'ER_BAD_NULL_ERROR':
                mensagem = 'Os dados fornecidos não são válidos';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

module.exports = router;
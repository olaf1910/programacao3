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
            { utilizador_id: utilizador.id, nome_utilizador: utilizador.nome_utilizador , funcao: utilizador.funcao_nome },
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

// Rota para buscar todos os utilizadores
router.get('/', autenticar, verificarFuncao([Funcoes.ADMIN, Funcoes.LIDER_EQUIPA]), async (req, res) => {
    try {
        const consulta = `
            SELECT 
                u.id, 
                u.nome_utilizador, 
                u.email, 
                f.nome as funcao, 
                u.criado_em 
            FROM Utilizadores u
            JOIN Funcoes f ON u.funcao_id = f.id
            ORDER BY u.id ASC;
        `;
        const [utilizadores] = await conexao.query(consulta);
        
        res.json(utilizadores);

    } catch (erro) {
        console.error('Erro ao obter todos os utilizadores:', erro);
        let mensagem = 'Erro interno do servidor ao obter utilizadores.';
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados.';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados.';
                break;
        }
        res.status(500).json({ mensagem });
    }
});

// ROTA PARA BUSCAR UM UTILIZADOR ESPECÍFICO POR ID
router.get('/:utilizador_id', autenticar, async (req, res) => {
    const idParaBuscar = parseInt(req.params.utilizador_id);
    const idUtilizadorAutenticado = parseInt(req.utilizador.utilizador_id);
    const funcaoUtilizadorAutenticado = req.utilizador.funcao;

    // Permitir acesso se for o próprio utilizador ou se for um admin
    if (idUtilizadorAutenticado !== idParaBuscar && funcaoUtilizadorAutenticado !== Funcoes.ADMIN) {
        return res.status(403).json({ mensagem: 'Acesso proibido. Não tem permissão para ver os detalhes deste utilizador.' });
    }

    try {
        const consulta = `
            SELECT 
                u.id, 
                u.nome_utilizador, 
                u.email, 
                f.nome as funcao, 
                u.criado_em
            FROM Utilizadores u
            JOIN Funcoes f ON u.funcao_id = f.id
            WHERE u.id = ?;
        `;
        const [utilizadores] = await conexao.query(consulta, [idParaBuscar]);

        if (utilizadores.length === 0) {
            return res.status(404).json({ mensagem: 'Utilizador não encontrado.' });
        }

        // Não retornar password_hash
        res.json(utilizadores[0]);

    } catch (erro) {
        console.error(`Erro ao buscar utilizador ${idParaBuscar}:`, erro);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao buscar utilizador.' });
    }
});

// ROTA PARA ATUALIZAR UM UTILIZADOR (APENAS ADMIN)
router.put('/:utilizador_id', autenticar, verificarFuncao([Funcoes.ADMIN]), async (req, res) => {
    const { utilizador_id } = req.params;
    const { nome_utilizador, email, funcao } = req.body;

    // Validações básicas de entrada
    if (!nome_utilizador && !email && !funcao) {
        return res.status(400).json({ mensagem: 'Pelo menos um campo (nome_utilizador, email, funcao) deve ser fornecido para atualização.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensagem: 'O email fornecido não é válido.' });
    }
    if (funcao) {
        const funcoesValidas = Object.values(Funcoes); // Assumindo que Funcoes é um objeto como { ADMIN: 'admin', ... }
        if (!funcoesValidas.includes(funcao)) {
            return res.status(400).json({ mensagem: `A função deve ser uma das seguintes: ${funcoesValidas.join(', ')}` });
        }
    }

    try {
        // Verificar se o utilizador existe
        const [utilizadoresExistentes] = await conexao.query('SELECT * FROM Utilizadores WHERE id = ?', [utilizador_id]);
        if (utilizadoresExistentes.length === 0) {
            return res.status(404).json({ mensagem: 'Utilizador não encontrado.' });
        }

        // Construir a query de atualização dinamicamente
        const camposParaAtualizar = {};
        if (nome_utilizador) camposParaAtualizar.nome_utilizador = nome_utilizador;
        if (email) camposParaAtualizar.email = email;
        // Para 'funcao', precisamos do ID da função
        if (funcao) {
            const [funcaoRow] = await conexao.query('SELECT id FROM Funcoes WHERE nome = ?', [funcao]);
            if (funcaoRow.length === 0) {
                return res.status(400).json({ mensagem: 'Função especificada não existe.' });
            }
            camposParaAtualizar.funcao_id = funcaoRow[0].id;
        }
        
        if (Object.keys(camposParaAtualizar).length === 0) {
             return res.status(400).json({ mensagem: 'Nenhum campo válido fornecido para atualização após conversão de função.' });
        }

        await conexao.query('UPDATE Utilizadores SET ? WHERE id = ?', [camposParaAtualizar, utilizador_id]);

        // Retornar o utilizador atualizado
        const [utilizadorAtualizado] = await conexao.query(
            `SELECT u.id, u.nome_utilizador, u.email, f.nome as funcao, u.criado_em 
             FROM Utilizadores u
             JOIN Funcoes f ON u.funcao_id = f.id
             WHERE u.id = ?`,
            [utilizador_id]
        );

        res.json(utilizadorAtualizado[0]);

    } catch (erro) {
        console.error(`Erro ao atualizar utilizador ${utilizador_id}:`, erro);
        let mensagem = 'Erro interno do servidor ao atualizar utilizador.';
        if (erro.code === 'ER_DUP_ENTRY') {
            mensagem = 'Nome de utilizador ou email já existe em outro registo.';
        } else if (erro.code === 'ER_NO_REFERENCED_ROW_2' && erro.sqlMessage.includes('funcao_id')) {
            mensagem = 'Função especificada não existe (erro de FK).'; // Improvável devido à verificação anterior
        }
        res.status(500).json({ mensagem });
    }
});


// ROTA PARA ELIMINAR UM UTILIZADOR (APENAS ADMIN)
router.delete('/:utilizador_id', autenticar, verificarFuncao([Funcoes.ADMIN]), async (req, res) => {
    const { utilizador_id } = req.params;

    // Prevenção: Não permitir que o admin se auto-elimine ou elimine o utilizador admin principal por esta via simples.
    if (parseInt(req.utilizador.utilizador_id) === parseInt(utilizador_id)) {
        return res.status(403).json({ mensagem: 'Não pode eliminar a sua própria conta de administrador por esta via.' });
    }

    try {
        // Verificar se o utilizador existe antes de tentar eliminar
        const [utilizadoresExistentes] = await conexao.query('SELECT id FROM Utilizadores WHERE id = ?', [utilizador_id]);
        if (utilizadoresExistentes.length === 0) {
            return res.status(404).json({ mensagem: 'Utilizador não encontrado.' });
        }
        
        // Tentar eliminar o utilizador
        const [resultado] = await conexao.query('DELETE FROM Utilizadores WHERE id = ?', [utilizador_id]);

        if (resultado.affectedRows === 0) {
            // Isto não deveria acontecer se a verificação acima encontrar o utilizador,
            // mas é uma salvaguarda.
            return res.status(404).json({ mensagem: 'Utilizador não encontrado para eliminação (ou já eliminado).' });
        }

        res.status(204).send(); // 204 No Content para sucesso na eliminação

    } catch (erro) {
        console.error(`Erro ao eliminar utilizador ${utilizador_id}:`, erro);
        let mensagem = 'Erro interno do servidor ao eliminar utilizador.';
        if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
            mensagem = 'Não é possível eliminar este utilizador porque ele está referenciado noutros registos (ex: tarefas, atribuições). Resolva essas dependências primeiro.';
        }
        res.status(500).json({ mensagem });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const Funcoes = require('../config/funcoes');

router.post('/', autenticar, verificarFuncao([Funcoes.GERENTE]), async (req, res) => {
    const { descricao } = req.body;
    try {
        const [resultado] = await conexao.query('INSERT INTO Tarefas (descricao, criado_por) VALUES (?, ?)', [descricao, req.utilizador.utilizador_id]);
        const [novatarefa] = await conexao.query(`SELECT t.*, u.id as atribuido_id, u.nome_utilizador as atribuido_nome, a.inicio, a.fim 
                        FROM Tarefas t 
                        LEFT OUTER JOIN Tarefas_Atribuicoes a ON t.id = a.tarefa_id 
                        LEFT OUTER JOIN Utilizadores u ON a.atribuido_a = u.id
                        WHERE t.id = ?`, [resultado.insertId]);
        res.status(201).json(novatarefa[0]);
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

router.get('/', autenticar, verificarFuncao([Funcoes.GERENTE, Funcoes.LIDER_EQUIPA, Funcoes.PROGRAMADOR]), async (req, res) => {
    try {
        let consulta = `SELECT 
                            t.*, 
                            u.id as utilizador_atribuido_id, 
                            u.nome_utilizador as utilizador_atribuido_nome, 
                            a.id as atribuicao_id, 
                            a.inicio, 
                            a.fim 
                        FROM Tarefas t 
                        LEFT OUTER JOIN Tarefas_Atribuicoes a ON t.id = a.tarefa_id 
                        LEFT OUTER JOIN Utilizadores u ON a.atribuido_a = u.id`;
        if (req.utilizador.funcao === Funcoes.GERENTE) {
            consulta += ` WHERE t.criado_por = ?`;  
        }
        consulta += ';';
        const [tarefas] = await conexao.query(consulta, req.utilizador.funcao === Funcoes.GERENTE ? [req.utilizador.utilizador_id] : []);
        res.json(tarefas);
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

router.put('/:tarefa_id', autenticar, verificarFuncao([Funcoes.GERENTE]), async (req, res) => {
    const { tarefa_id } = req.params;
    const { descricao } = req.body;
    try {
        const [tarefa] = await conexao.query('SELECT * FROM Tarefas WHERE id = ? AND criado_por = ?', [tarefa_id, req.utilizador.utilizador_id]);
        if (!tarefa[0]) return res.status(404).json({ mensagem: 'Tarefa não encontrada' });
        if (tarefa[0].estado !== 'nao_atribuida') return res.status(403).json({ mensagem: 'Tarefa já atribuída' });
        await conexao.query('UPDATE Tarefas SET descricao = ? WHERE id = ?', [descricao, tarefa_id]);
        let consulta = `SELECT t.*, u.id as atribuido_id, u.nome_utilizador as atribuido_nome, a.inicio, a.fim 
                        FROM Tarefas t 
                        LEFT OUTER JOIN Tarefas_Atribuicoes a ON t.id = a.tarefa_id 
                        LEFT OUTER JOIN Utilizadores u ON a.atribuido_a = u.id
                        WHERE t.id = ?`;
        const [tarefaUpdated] = await conexao.query(consulta, [tarefa_id]);
        res.json(tarefaUpdated[0]);
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

router.delete('/:tarefa_id', autenticar, verificarFuncao([Funcoes.GERENTE]), async (req, res) => {
    const { tarefa_id } = req.params;
    try {
        const [tarefa] = await conexao.query('SELECT * FROM Tarefas WHERE id = ? AND criado_por = ?', [tarefa_id, req.utilizador.utilizador_id]);
        if (!tarefa[0]) return res.status(404).json({ mensagem: 'Tarefa não encontrada' });
        if (tarefa[0].estado !== 'nao_atribuida') return res.status(403).json({ mensagem: 'Tarefa já atribuída' });
        await conexao.query('DELETE FROM Tarefas WHERE id = ?', [tarefa_id]);
        res.status(204).send();
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            case 'ER_NO_SUCH_TABLE':
                mensagem = 'Tabela não encontrada na base de dados';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

module.exports = router;
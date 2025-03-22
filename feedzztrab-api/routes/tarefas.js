const express = require('express');
const router = express.Router();
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const Funcoes = require('../config/funcoes');

router.post('/', autenticar, verificarFuncao([Funcoes.GERENTE]), async (req, res) => {
    const { descricao } = req.body;
    try {
        const [resultado] = await conexao.query('INSERT INTO Jobs (description, created_by) VALUES (?, ?)', [descricao, req.utilizador.utilizador_id]);
        const tarefa = { tarefa_id: resultado.insertId, descricao, criado_por: req.utilizador.utilizador_id, estado: 'nao_atribuida' };
        res.status(201).json(tarefa);
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

router.get('/', autenticar, verificarFuncao([Funcoes.GERENTE, Funcoes.LIDER_EQUIPA]), async (req, res) => {
    try {
        const consulta = req.utilizador.funcao === Funcoes.GERENTE
            ? 'SELECT * FROM Jobs WHERE created_by = ?'
            : 'SELECT * FROM Jobs';
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
        const [tarefa] = await conexao.query('SELECT * FROM Jobs WHERE job_id = ? AND created_by = ?', [tarefa_id, req.utilizador.utilizador_id]);
        if (!tarefa[0]) return res.status(404).json({ mensagem: 'Tarefa não encontrada' });
        if (tarefa[0].status !== 'unassigned') return res.status(403).json({ mensagem: 'Tarefa já atribuída' });
        await conexao.query('UPDATE Jobs SET description = ? WHERE job_id = ?', [descricao, tarefa_id]);
        res.json({ ...tarefa[0], descricao });
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
        const [tarefa] = await conexao.query('SELECT * FROM Jobs WHERE job_id = ? AND created_by = ?', [tarefa_id, req.utilizador.utilizador_id]);
        if (!tarefa[0]) return res.status(404).json({ mensagem: 'Tarefa não encontrada' });
        if (tarefa[0].status !== 'unassigned') return res.status(403).json({ mensagem: 'Tarefa já atribuída' });
        await conexao.query('DELETE FROM Jobs WHERE job_id = ?', [tarefa_id]);
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
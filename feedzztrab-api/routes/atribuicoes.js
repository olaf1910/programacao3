const express = require('express');
const router = express.Router();
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const Funcoes = require('../config/funcoes');

router.post('/', autenticar, verificarFuncao([Funcoes.LIDER_EQUIPA]), async (req, res) => {
    const { tarefa_id, atribuido_a } = req.body;
    try {
        const [tarefa] = await conexao.query('SELECT * FROM Jobs WHERE job_id = ?', [tarefa_id]);
        if (!tarefa[0] || tarefa[0].status !== 'unassigned') return res.status(400).json({ mensagem: 'Tarefa inválida ou já atribuída' });
        const [ativa] = await conexao.query('SELECT COUNT(*) as ativa FROM Job_Assignments WHERE assigned_to = ? AND start_time IS NOT NULL AND end_time IS NULL', [atribuido_a]);
        if (ativa[0].ativa > 0) return res.status(409).json({ mensagem: 'Conflito: programador tem uma tarefa ativa' });
        const [resultado] = await conexao.query('INSERT INTO Job_Assignments (job_id, assigned_to, assigned_by) VALUES (?, ?, ?)', [tarefa_id, atribuido_a, req.utilizador.utilizador_id]);
        await conexao.query('UPDATE Jobs SET status = "assigned" WHERE job_id = ?', [tarefa_id]);
        res.status(201).json({ atribuicao_id: resultado.insertId, tarefa_id, atribuido_a, atribuido_por: req.utilizador.utilizador_id });
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_DUP_ENTRY':
                mensagem = 'Atribuição já existe';
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                mensagem = 'Tarefa ou utilizador não existe';
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                mensagem = 'Acesso negado à base de dados';
                break;
            default:
                mensagem = erro.message;
        }
        res.status(500).json({ mensagem });
    }
});

router.patch('/:atribuicao_id', autenticar, verificarFuncao([Funcoes.PROGRAMADOR]), async (req, res) => {
    const { atribuicao_id } = req.params;
    const { hora_inicio, hora_fim } = req.body;
    try {
        const [atribuicao] = await conexao.query('SELECT * FROM Job_Assignments WHERE assignment_id = ? AND assigned_to = ?', [atribuicao_id, req.utilizador.utilizador_id]);
        if (!atribuicao[0]) return res.status(404).json({ mensagem: 'Atribuição não encontrada' });
        await conexao.query('UPDATE Job_Assignments SET start_time = ?, end_time = ? WHERE assignment_id = ?', [hora_inicio || atribuicao[0].start_time, hora_fim || atribuicao[0].end_time, atribuicao_id]);
        if (hora_fim) await conexao.query('UPDATE Jobs SET status = "completed" WHERE job_id = ?', [atribuicao[0].job_id]);
        const [atualizada] = await conexao.query('SELECT * FROM Job_Assignments WHERE assignment_id = ?', [atribuicao_id]);
        res.json(atualizada[0]);
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
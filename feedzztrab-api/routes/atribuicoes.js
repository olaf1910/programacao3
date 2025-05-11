const express = require('express');
const router = express.Router();
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const Funcoes = require('../config/funcoes');

router.post('/', autenticar, verificarFuncao([Funcoes.LIDER_EQUIPA]), async (req, res) => {
    const { tarefa_id, atribuido_a } = req.body;
    try {
        const [tarefa] = await conexao.query('SELECT * FROM Tarefas WHERE id = ?', [tarefa_id]);
        if (!tarefa[0] || tarefa[0].estado !== 'nao_atribuida') return res.status(400).json({ mensagem: 'Tarefa inválida ou já atribuída' });
        const [ativa] = await conexao.query('SELECT COUNT(*) as ativa FROM Tarefas_Atribuicoes WHERE atribuido_a = ? AND inicio IS NOT NULL AND fim IS NULL', [atribuido_a]);
        if (ativa[0].ativa > 0) return res.status(409).json({ mensagem: 'Conflito: programador tem uma tarefa ativa' });
        const [resultado] = await conexao.query('INSERT INTO Tarefas_Atribuicoes (tarefa_id, atribuido_a, atribuido_por) VALUES (?, ?, ?)', [tarefa_id, atribuido_a, req.utilizador.utilizador_id]);
        await conexao.query('UPDATE Tarefas SET estado = "atribuida" WHERE id = ?', [tarefa_id]);
        res.status(201).json({ id: resultado.insertId, tarefa_id, atribuido_a, atribuido_por: req.utilizador.utilizador_id, inicio: null, fim: null });
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
    const { inicio, fim } = req.body;
    if (!atribuicao_id) return res.status(400).json({ mensagem: 'Tem de indicar o id da atribuicao' });
    if (!inicio && !fim) return res.status(400).json({ mensagem: 'Dados inválidos' });

    try {
        const [atribuicao] = await conexao.query('SELECT * FROM Tarefas_Atribuicoes WHERE id = ?', [atribuicao_id]);
        if (!atribuicao[0]) return res.status(404).json({ mensagem: 'Atribuição não encontrada' });

        if (atribuicao[0].atribuido_a !== req.utilizador.utilizador_id) {
            return res.status(403).json({ mensagem: 'Proibido: só pode atualizar as suas próprias atribuições.' });
        }
        
        if (inicio && atribuicao[0].inicio && !fim) return res.status(400).json({ mensagem: 'A tarefa já está iniciada' });
        if (fim && atribuicao[0].fim) return res.status(400).json({ mensagem: 'A tarefa já está concluida' });

        if ( fim && (inicio || atribuicao[0].inicio) > new Date(fim)) return res.status(400).json({ mensagem: 'O fim deve ser posterior ao início' });
        
        if (inicio && !fim) {
            await conexao.query('UPDATE Tarefas_Atribuicoes SET inicio = ? WHERE id = ?', [new Date(inicio).toISOString().slice(0, 19).replace('T', ' ') || atribuicao[0].inicio, atribuicao_id]);
        } else {
            if (!inicio && fim) {
                await conexao.query('UPDATE Tarefas_Atribuicoes SET fim = ? WHERE id = ?', [new Date(fim).toISOString().slice(0, 19).replace('T', ' ') || atribuicao[0].fim, atribuicao_id]);
            } else {
                await conexao.query('UPDATE Tarefas_Atribuicoes SET inicio = ?, fim = ? WHERE id = ?', [new Date(inicio).toISOString().slice(0, 19).replace('T', ' ') || atribuicao[0].inicio, new Date(fim).toISOString().slice(0, 19).replace('T', ' ') || atribuicao[0].fim, atribuicao_id]);
            }
        }
        if (inicio && !fim) await conexao.query('UPDATE Tarefas SET estado = "em_progresso" WHERE id = ?', [atribuicao[0].tarefa_id]);
        
        if (fim) await conexao.query('UPDATE Tarefas SET estado = "concluida" WHERE id = ?', [atribuicao[0].tarefa_id]);
        const [atualizada] = await conexao.query(`SELECT t.*, u.id as atribuido_id, u.nome_utilizador as atribuido_nome, a.inicio, a.fim 
                        FROM Tarefas t 
                        LEFT OUTER JOIN Tarefas_Atribuicoes a ON t.id = a.tarefa_id 
                        LEFT OUTER JOIN Utilizadores u ON a.atribuido_a = u.id
                        WHERE t.id = ?`, [atribuicao[0].tarefa_id]);
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
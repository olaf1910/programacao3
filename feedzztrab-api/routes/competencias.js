const express = require('express');
const router = express.Router();
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const Funcoes = require('../config/funcoes');

router.post('/', autenticar, verificarFuncao([Funcoes.PROGRAMADOR]), async (req, res) => {
    const { utilizador_id } = req.params;
    const { competencia_id } = req.body;
    if (req.utilizador.utilizador_id != utilizador_id) return res.status(403).json({ mensagem: 'Proibido: apenas o próprio programador pode adicionar competências' });
    try {
        await conexao.query('INSERT INTO User_Skills (user_id, skill_id) VALUES (?, ?)', [utilizador_id, competencia_id]);
        const [competencia] = await conexao.query('SELECT * FROM Skills WHERE skill_id = ?', [competencia_id]);
        res.status(201).json(competencia[0]);
    } catch (erro) {
        let mensagem;
        switch (erro.code) {
            case 'ER_DUP_ENTRY':
                mensagem = 'Competência já associada a este utilizador';
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                mensagem = 'Competência ou utilizador não existe';
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

module.exports = router;
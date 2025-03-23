const express = require('express');
const router = express.Router({ mergeParams: true });
const conexao = require('../config/database');
const { autenticar, verificarFuncao } = require('../middlewares/autenticacao');
const Funcoes = require('../config/funcoes');

router.post('/', autenticar, verificarFuncao([Funcoes.PROGRAMADOR]), async (req, res) => {
    const { utilizador_id } = req.params;
    const { competencia } = req.body;

    if (req.utilizador.utilizador_id != utilizador_id) {
        return res.status(403).json({ mensagem: 'Proibido: apenas o próprio programador pode adicionar competências' });
    }

    if (!competencia || typeof competencia !== 'string' || competencia.trim() === '') {
        return res.status(400).json({ mensagem: 'Nome da competência é obrigatório e deve ser uma string válida' });
    }

    try {
        let [existingCompetencia] = await conexao.query(
            'SELECT id FROM Competencias WHERE nome = ?',
            [competencia.trim()]
        );

        let competencia_id;

        if (existingCompetencia.length === 0) {
            const [result] = await conexao.query(
                'INSERT INTO Competencias (nome) VALUES (?)',
                [competencia.trim()]
            );
            competencia_id = result.insertId;
        } else {
            competencia_id = existingCompetencia[0].id;
        }

        const [existingAssociation] = await conexao.query(
            'SELECT * FROM Competencias_Utilizadores WHERE utilizador_id = ? AND competencia_id = ?',
            [utilizador_id, competencia_id]
        );

        if (existingAssociation.length > 0) {
            return res.status(409).json({ mensagem: 'Competência já associada a este utilizador' });
        }

        await conexao.query(
            'INSERT INTO Competencias_Utilizadores (utilizador_id, competencia_id) VALUES (?, ?)',
            [utilizador_id, competencia_id]
        );

        const [competencias] = await conexao.query(
            `select c.* 
            from Competencias_Utilizadores a 
            inner join Competencias c on c.id = a.competencia_id 
            where a.utilizador_id = ?;`,
            [req.utilizador.utilizador_id]
        );

        res.status(201).json(competencias);

    } catch (erro) {
        let mensagem;
        switch (erro.code) {
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
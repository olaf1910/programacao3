const express = require('express');
const app = express();
require('dotenv').config();

const utilizadoresRotas = require('./routes/utilizadores');
const competenciasRotas = require('./routes/competencias');
const tarefasRotas = require('./routes/tarefas');
const atribuicoesRotas = require('./routes/atribuicoes');

app.use(express.json());

app.use('/api/utilizadores', utilizadoresRotas);           // /api/utilizadores, /api/utilizadores/login
app.use('/api/utilizadores/:utilizador_id/competencias', competenciasRotas); // /api/utilizadores/{utilizador_id}/competencias
app.use('/api/tarefas', tarefasRotas);                    // /api/tarefas
app.use('/api/atribuicoes', atribuicoesRotas);            // /api/atribuicoes

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
    console.log(`Servidor a executar na porta ${porta}`);
});
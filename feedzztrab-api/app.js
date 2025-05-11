const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET'];
requiredEnv.forEach(key => {
    if (!process.env[key]) throw new Error(`Variável de ambiente ${key} não definida`);
});

const utilizadoresRotas = require('./routes/utilizadores');
const competenciasRotas = require('./routes/competencias');
const tarefasRotas = require('./routes/tarefas');
const atribuicoesRotas = require('./routes/atribuicoes');

app.use(cors());
app.use(express.json());

app.use('/api/utilizadores', utilizadoresRotas);
app.use('/api/utilizadores/:utilizador_id/competencias', competenciasRotas);
app.use('/api/tarefas', tarefasRotas);
app.use('/api/atribuicoes', atribuicoesRotas);

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per IP
});
app.use('/api/utilizadores/login', limiter);

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
    console.log(`Servidor a executar na porta ${porta}`);
});
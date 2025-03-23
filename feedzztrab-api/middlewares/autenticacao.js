const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensagem: 'Token não fornecido' });

    jwt.verify(token, process.env.JWT_SECRET, (erro, utilizador) => {
        if (erro) return res.status(403).json({ mensagem: 'Token inválido' });
        req.utilizador = utilizador;
        next();
    });
};

const verificarFuncao = (funcoes) => (req, res, next) => {
    if (!funcoes.includes(req.utilizador.funcao)) {
        return res.status(403).json({ mensagem: `Acesso proibido: requer função ${funcoes.join(' ou ')}` });
    }
    next();
};

module.exports = { autenticar, verificarFuncao };
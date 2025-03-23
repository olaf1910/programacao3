## Projecto prático para Programacao III

### INSTITUTO SUPERIOR MIGUEL TORGA  
<br />
<br />
<br />

# FEEDZZTRAB
<pre>
Aplicação para gestão de tarefas de equipas de trabalho.
</pre>
----------

Para visualizar a especificação OpenAPI 3.0.0 do projeto, aceda ao link:
https://editor.swagger.io

Base de dados hospedada no serviço https://freedb.tech
Dashboard: https://freedb.tech/dashboard/stats.php
PhPMyAdmin: https://phpmyadmin.freedb.tech/index.php?route=/database/sql&db=freedb_programacao3
Limitações:
- MAX USER_CONNECTIONS = 100
- MAX QUERIES PER HOUR = 1000
- innodb_buffer_pool_size = 1M
- performance_schema = off

bCrypt Generator:
https://bcrypt-generator.com


## Instalação
1. Clone o repositório: `git clone <url>`
2. Mude para a pasta da API: `cd feedztrab-api`
3. Instale dependências: `npm install`
4. Configure `.env` com `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `PORT`
5. Ficheiro env de exemplo em env.example
6. Execute: `npm run start` ou `npm run dev`

## Dependências
- express
- express-validator
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv

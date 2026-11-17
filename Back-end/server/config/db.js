const { Client } = require('pg');
const path = require('path');

// Lê Back-end/server/.env (copie de .env.example); sem o arquivo, usa variáveis do ambiente
try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch (e) {}

const con = new Client({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'deposito_vieira',
  port: Number(process.env.DB_PORT || 5432),
});

con.connect()
  .then(() => console.log("Banco de dados conectado"))
  .catch(err => console.error("Erro ao conectar ao banco:", err));

module.exports = con;

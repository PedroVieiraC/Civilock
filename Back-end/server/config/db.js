const { Client } = require('pg');

const con = new Client({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'RitterConstruct',
  port: 5432,
});

con.connect()
  .then(() => console.log("Banco de dados conectado"))
  .catch(err => console.error("Erro ao conectar ao banco:", err));

module.exports = con;

require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexão com MySQL realizada com sucesso.");
    connection.release();
  } catch (error) {
    console.error("Erro ao conectar no MySQL:");
    console.error(error.message);
  }
}

testDatabaseConnection();
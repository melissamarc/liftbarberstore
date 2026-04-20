require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function interpretarVendaComIA(mensagem, produtos) {
  // lista simplificada dos produtos
  const listaProdutos = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
  }));

  const prompt = `
Você é um sistema que interpreta pedidos de clientes.

Mensagem do cliente:
"${mensagem}"

Produtos disponíveis:
${JSON.stringify(listaProdutos)}

Regras:
- Escolha apenas produtos que existam na lista
- Identifique quantidade
- Se não tiver quantidade, use 1
- Responda apenas JSON

Formato da resposta:
{
  "itens": [
    {
      "produto_id": number,
      "quantidade": number
    }
  ]
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const texto = response.choices[0].message.content;

  try {
    return JSON.parse(texto);
  } catch (error) {
    throw new Error("Erro ao interpretar resposta da IA.");
  }
}

module.exports = {
  interpretarVendaComIA,
};
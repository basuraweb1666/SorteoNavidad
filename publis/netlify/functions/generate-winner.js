import fs from "fs";
import path from "path";

export const handler = async (event, context) => {
  const winnerFile = path.resolve("/tmp/winner.json");

  // Si ya existe el archivo, devolver el número guardado
  if (fs.existsSync(winnerFile)) {
    const data = JSON.parse(fs.readFileSync(winnerFile, "utf8"));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  }

  // Generar número aleatorio (una sola vez)
  const winner = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const data = { winner, generated_at: new Date().toISOString() };

  // Guardar temporalmente (Netlify mantendrá en /tmp durante ejecución)
  fs.writeFileSync(winnerFile, JSON.stringify(data, null, 2));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};

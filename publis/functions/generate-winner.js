import { neon } from '@netlify/neon';

const sql = neon(); // Usa automáticamente NETLIFY_DATABASE_URL

export async function handler(event, context) {
  try {
    // Generar número aleatorio del 0 al 999
    const winner = Math.floor(Math.random() * 1000);

    // Guardar en DB (tabla "winners" con columna "number")
    await sql`INSERT INTO winners (number, created_at) VALUES (${winner}, now())`;

    return {
      statusCode: 200,
      body: JSON.stringify({ winner }),
    };
  } catch (error) {
    console.error('Error generando ganador:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error generando ganador' }),
    };
  }
}

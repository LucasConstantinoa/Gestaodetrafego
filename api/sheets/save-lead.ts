import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Em um ambiente real, os tokens seriam carregados de um armazenamento seguro (DB).
// Para este exemplo, vamos simular que temos os tokens.
// Você precisará autenticar uma vez para obter um refresh_token e armazená-lo.
// O access_token pode ser gerado a partir do refresh_token.
let storedTokens = {
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN, // Você precisará obter e definir isso
  // access_token: '...', // Será gerado
  // expiry_date: '...', // Será gerado
};

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, instagram, whatsapp } = req.body;

  if (!name || !instagram || !whatsapp) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    // Define as credenciais com o refresh token
    oauth2Client.setCredentials({
      refresh_token: storedTokens.refresh_token,
    });

    // Garante que temos um access token válido
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const sheets = google.sheets({
      version: 'v4',
      auth: oauth2Client,
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // ID da sua planilha
    const range = 'Leads!A:D'; // Nome da aba e colunas

    const values = [
      [new Date().toISOString(), name, instagram, whatsapp],
    ];

    const resource = {
      values,
    };

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: resource,
    });

    console.log('Lead salvo no Google Sheets com sucesso!');
    res.status(200).json({ success: true, message: 'Lead salvo no Sheets' });
  } catch (error: any) {
    console.error('Erro ao salvar lead no Google Sheets:', error.message);
    res.status(500).json({ error: 'Erro ao salvar lead no Google Sheets', details: error.message });
  }
}

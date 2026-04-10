import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function (req: VercelRequest, res: VercelResponse) {
  const { code, state } = req.query;

  // Em um ambiente real, você verificaria o 'state' para prevenir ataques CSRF.
  // Por simplicidade, estamos pulando essa verificação aqui.

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Em um ambiente real, você salvaria os tokens (especialmente o refresh_token)
    // em um banco de dados seguro associado ao seu usuário.
    // Para este exemplo, vamos apenas enviar uma mensagem de sucesso.
    console.log('Tokens recebidos:', tokens);

    // Redireciona de volta para o frontend com uma mensagem de sucesso
    // ou armazena os tokens e redireciona para o painel do cliente.
    res.send(`
      <html>
        <head><title>Autenticação Google</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
              window.close();
            } else {
              window.location.href = '/'; // Fallback
            }
          </script>
          <p>Autenticação com Google Sheets bem-sucedida! Esta janela será fechada automaticamente.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Erro ao trocar código por tokens:', error.message);
    res.status(500).send(`
      <html>
        <head><title>Erro de Autenticação</title></head>
        <body>
          <p>Erro ao autenticar com Google Sheets: ${error.message}</p>
          <button onclick="window.close()">Fechar</button>
        </body>
      </html>
    `);
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export default async function (req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://ais-dev-wuwbx7zohkup3yeki2ewpk-184778435493.us-east1.run.app/api/auth/google/callback';
  
  if (!clientId || !clientSecret) {
    console.error('ERRO: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados nos Secrets.');
    return res.status(500).send('Erro de configuração: Credenciais do Google ausentes no painel de Secrets.');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  console.log('Iniciando OAuth para Client ID:', clientId.substring(0, 10) + '...');
  
  const state = uuidv4();

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    prompt: 'consent',
    state: state,
    client_id: clientId, // Passando explicitamente aqui
    redirect_uri: redirectUri
  });

  res.redirect(authorizationUrl);
}

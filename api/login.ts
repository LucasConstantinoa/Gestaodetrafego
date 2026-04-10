import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  try {
    const supabaseUrl = (process.env.SUPABASE_URL_CERTA || process.env.SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.SUPABASE_ANON_KEY_CERTA || process.env.SUPABASE_ANON_KEY || '').trim();
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Configuração do banco de dados ausente.' });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Verifica se é o Administrador (Lucas Constantino)
    if (email === 'brtreino@gmail.com' && (password === 'Escroto12.' || password === '123456')) {
      return res.status(200).json({ 
        success: true, 
        role: 'admin', 
        user: { name: 'Lucas Constantino', email } 
      });
    }

    // 2. Verifica se é um Cliente cadastrado no banco de dados
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email, password, business_name')
      .ilike('email', email); // Case-insensitive email search
      
    if (error) {
      console.error('Supabase Error during login:', error);
      return res.status(500).json({ error: `Erro no banco: ${error.message}` });
    }
    
    const client = clients && clients.length > 0 ? clients[0] : null;
    
    if (!client) {
      return res.status(401).json({ error: 'E-mail não encontrado no sistema.' });
    }

    if (client.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
    
    // Remove a senha antes de retornar
    delete client.password;

    return res.status(200).json({ 
      success: true, 
      role: 'client', 
      user: client 
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
  }
}

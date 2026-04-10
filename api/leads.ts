import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;
  
  // Extrai o ID da URL se existir
  const id = query.id || req.url?.split('/').pop();

  try {
    const supabaseUrl = (process.env.SUPABASE_URL_CERTA || '').trim();
    const supabaseKey = (process.env.SUPABASE_ANON_KEY_CERTA || '').trim();

    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      throw new Error('A URL do Supabase não está configurada corretamente no painel de ambiente. Verifique se ela começa com https://');
    }
    if (!supabaseKey) {
      throw new Error('A chave (Anon Key) do Supabase não está configurada.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return res.status(200).json(data || []);
    } 
    else if (method === 'POST') {
      const { name, instagram, whatsapp } = body;
      const { data, error } = await supabase
        .from('leads')
        .insert([{ name, instagram, whatsapp }])
        .select();
        
      if (error) throw error;
      return res.status(201).json({ success: true, lead: data[0] });
    }
    else if (method === 'DELETE') {
      if (!id || id === 'leads') return res.status(400).json({ error: 'ID missing' });
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    else if (method === 'PUT') {
      if (!id || id === 'leads') return res.status(400).json({ error: 'ID missing' });
      const { name, instagram, whatsapp, status, verdict, feedback } = body;
      
      const { error } = await supabase
        .from('leads')
        .update({ name, instagram, whatsapp, status, verdict, feedback })
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Supabase Error:', JSON.stringify(error, null, 2));
    const debugInfo = {
      urlSet: !!process.env.SUPABASE_URL_CERTA,
      urlPrefix: process.env.SUPABASE_URL_CERTA ? process.env.SUPABASE_URL_CERTA.substring(0, 8) : 'none',
      keySet: !!process.env.SUPABASE_ANON_KEY_CERTA,
      errorName: error?.name,
      errorCode: error?.code,
      errorHint: error?.hint,
      errorDetails: error?.details
    };
    return res.status(500).json({ 
      error: error.message || 'Erro desconhecido ao conectar com o banco de dados',
      debug: debugInfo
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body } = req;
  
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
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return res.status(200).json(data || []);
    } 
    else if (method === 'POST') {
      const name = body.name?.trim();
      const email = body.email?.trim();
      const password = body.password?.trim();
      const business_name = body.business_name?.trim();
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{ name, email, password, business_name }])
        .select();
        
      if (error) throw error;
      return res.status(201).json({ success: true, client: data[0] });
    }
    else if (method === 'PUT') {
      const { id, name, email, password, business_name } = body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (business_name) updateData.business_name = business_name;
      
      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return res.status(200).json({ success: true, client: data[0] });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Supabase Error:', JSON.stringify(error, null, 2));
    const debugInfo = {
      urlSet: !!process.env.SUPABASE_URL_CERTA,
      urlPrefix: process.env.SUPABASE_URL_CERTA ? process.env.SUPABASE_URL_CERTA.substring(0, 8) : 'none',
      keySet: !!process.env.SUPABASE_ANON_KEY_CERTA
    };
    return res.status(500).json({ 
      error: error.message,
      debug: debugInfo
    });
  }
}

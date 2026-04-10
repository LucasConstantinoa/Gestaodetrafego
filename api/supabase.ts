import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL_CERTA || process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY_CERTA || process.env.SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || supabaseUrl === 'sua_url_do_supabase' || !supabaseUrl.startsWith('http')) {
  console.error('ERRO CRÍTICO: SUPABASE_URL não está configurada corretamente.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);

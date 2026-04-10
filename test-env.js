import dotenv from 'dotenv';
dotenv.config();

console.log("URL:", process.env.SUPABASE_URL ? "Set" : "Missing");
console.log("KEY:", process.env.SUPABASE_ANON_KEY ? "Set" : "Missing");

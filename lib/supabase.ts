import { createClient } from '@supabase/supabase-js';

// Public client values (the same ones the app ships). What each person may read or change is enforced by database rules.
export const SUPABASE_URL = 'https://rfelzigknsclbiepzivl.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_MsML9oBlXo-ykliZPIZqeA_qsJUtCpX';
export const ADMIN_EMAIL = 'yurischevalier@gmail.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if URL is valid (starts with http)
const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

const supabaseUrl = isValidUrl(envUrl) ? envUrl! : 'https://placeholder.supabase.co';
const supabaseKey = envKey || 'placeholder-key';

if (!isValidUrl(envUrl)) {
    console.warn('⚠️ Supabase URL is missing or invalid. Using placeholder:', supabaseUrl);
}
if (!envKey) {
    console.warn('⚠️ Supabase Anon Key is missing. Using placeholder.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

let supabaseUrl = 'https://upvggiqvejvxnwlamuvd.supabase.co';
let supabaseKey = 'sb_publishable_zl__CM4NQNdoJYs2zeJeag_WnDdAReW';

// Check if running on localhost or 127.0.0.1
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (!isLocal) {
    try {
        // In production (Vercel), fetch keys from serverless function
        const res = await fetch('/api/config');
        if (res.ok) {
            const data = await res.json();
            if (data.SUPABASE_URL && data.SUPABASE_ANON_KEY) {
                supabaseUrl = data.SUPABASE_URL;
                supabaseKey = data.SUPABASE_ANON_KEY;
            }
        }
    } catch (e) {
        console.warn('Failed to fetch config from /api/config, using fallback keys.', e);
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey);

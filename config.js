
const SUPABASE_URL = 'https://upvggiqvejvxnwlamuvd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zl__CM4NQNdoJYs2zeJeag_WnDdAReW';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

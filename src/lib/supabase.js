import { createClient } from '@supabase/supabase-js'

const env = import.meta.env
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
const key = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY

export const missingEnv = !url || !key
export const supabase = missingEnv ? null : createClient(url, key)

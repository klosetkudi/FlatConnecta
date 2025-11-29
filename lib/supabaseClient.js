// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env, NOT process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'

// Create client with fallback values to prevent crashes
// Replace with your actual Supabase credentials when ready
export const supabase = createClient(supabaseUrl, supabaseKey)

// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wmftwzemjfpymoknezta.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnR3emVtamZweW1va25lenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTgzMTUsImV4cCI6MjA2NTg5NDMxNX0.jZ2IONurUqllBq7JAw8xptTMGzwclBec-U06uCY9b5k";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
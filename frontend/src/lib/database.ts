// Database table definitions for YawtAI

export const YAWTAI_DOWNLOADS_TABLE = 'yawtai_downloads';

export interface DownloadRecord {
  id?: string;
  platform: string;
  version: string;
  user_id?: string;
  user_email?: string;
  user_agent?: string;
  created_at?: string;
}

// SQL to create the downloads table
export const CREATE_DOWNLOADS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${YAWTAI_DOWNLOADS_TABLE} (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    version TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// RLS policies for the downloads table
export const DOWNLOADS_RLS_POLICIES = `
  -- Enable read access for authenticated users
  CREATE POLICY "Users can view all downloads" ON ${YAWTAI_DOWNLOADS_TABLE}
    FOR SELECT USING (auth.uid() = user_id);
  
  -- Enable insert for authenticated users
  CREATE POLICY "Users can insert downloads" ON ${YAWTAI_DOWNLOADS_TABLE}
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  -- Enable update for own downloads (if needed)
  CREATE POLICY "Users can update own downloads" ON ${YAWTAI_DOWNLOADS_TABLE}
    FOR UPDATE USING (auth.uid() = user_id);
  
  -- Enable delete for own downloads (if needed)
  CREATE POLICY "Users can delete own downloads" ON ${YAWTAI_DOWNLOADS_TABLE}
    FOR DELETE USING (auth.uid() = user_id);
`;

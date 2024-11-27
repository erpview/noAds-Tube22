import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Initialize database schema
export async function initializeDatabase() {
  // Create ad_play_counts table with unique constraint
  const { error: adPlayCountsError } = await supabase.rpc('create_ad_play_counts_table');
  
  if (adPlayCountsError) {
    console.error('Error creating ad_play_counts table:', adPlayCountsError);
  }

  // Create other tables
  const { error: profilesError } = await supabase.rpc('create_profiles_table');
  const { error: channelsError } = await supabase.rpc('create_channels_table');
  
  if (profilesError || channelsError) {
    console.error('Database initialization error:', { profilesError, channelsError });
  }
}

// Rest of the exports...
export async function deleteUser(userId: string) {
  // First delete user's data from related tables
  const { error: channelsError } = await supabase
    .from('user_channels')
    .delete()
    .eq('user_id', userId);

  if (channelsError) {
    console.error('Error deleting user channels:', channelsError);
  }

  // Delete user's profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    throw new Error('Failed to delete user profile');
  }

  // Delete user from auth.users using admin function
  const { error: authError } = await supabase.rpc('delete_user', {
    user_id: userId
  });

  if (authError) {
    throw new Error('Failed to delete user authentication');
  }
}

export async function getFavoriteChannels(userId: string) {
  const { data, error } = await supabase
    .from('user_channels')
    .select(`
      id,
      channel_id,
      channel_name,
      channel_thumbnail,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addFavoriteChannel(userId: string, channelData: {
  channel_id: string;
  channel_name: string;
  channel_thumbnail: string;
}) {
  const { error } = await supabase
    .from('user_channels')
    .insert([{
      user_id: userId,
      ...channelData
    }]);

  if (error) throw error;
}

export async function removeFavoriteChannel(userId: string, channelId: string) {
  const { error } = await supabase
    .from('user_channels')
    .delete()
    .eq('user_id', userId)
    .eq('channel_id', channelId);

  if (error) throw error;
}
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'tracex_demo_watchlist';

const DEFAULT_DEMO_ITEMS = [
  {
    id: 'demo-item-1',
    url: 'https://secure-login.apple-support-verify.com/auth',
    target_type: 'URL',
    threat_level: 'CRITICAL',
    notes: 'Known credential harvester masquerading as Apple support',
    risk_score: 0.965,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-item-2',
    url: 'https://xn--pple-43d.com/login',
    target_type: 'URL',
    threat_level: 'HIGH',
    notes: 'Punycode IDN homograph impersonating apple.com',
    risk_score: 0.820,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'demo-item-3',
    url: 'http://192.168.1.100/paypal/login.php',
    target_type: 'IP',
    threat_level: 'CRITICAL',
    notes: 'Raw IP credential stealer bypassing DNS logs',
    risk_score: 0.940,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'demo-item-4',
    url: 'http://account-update-banking.xyz/session/verify',
    target_type: 'URL',
    threat_level: 'HIGH',
    notes: 'Abuse-prone .xyz TLD with financial phishing keywords',
    risk_score: 0.880,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

// Helper to access demo local storage items
const getLocalItems = () => {
  if (typeof window === 'undefined') return DEFAULT_DEMO_ITEMS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_ITEMS));
      return DEFAULT_DEMO_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_DEMO_ITEMS;
  }
};

const saveLocalItems = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {}
};

/**
 * 1. READ: Fetch all watchlist items
 */
export async function getWatchlist(userId = null) {
  if (!isSupabaseConfigured()) {
    return { data: getLocalItems(), error: null, isDemo: true };
  }

  try {
    let query = supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null, isDemo: false };
  } catch (error) {
    console.warn('Supabase getWatchlist error, using local fallback:', error);
    return { data: getLocalItems(), error, isDemo: true };
  }
}

/**
 * 2. CREATE: Add new monitored threat or URL to watchlist
 */
export async function createWatchlistItem(item, userId = null) {
  const newItem = {
    url: item.url.trim(),
    target_type: item.target_type || 'URL',
    threat_level: item.threat_level || 'HIGH',
    notes: item.notes || '',
    risk_score: typeof item.risk_score === 'number' ? item.risk_score : 0.0,
    is_active: item.is_active !== undefined ? item.is_active : true,
    user_id: userId || null,
  };

  if (!isSupabaseConfigured()) {
    const local = getLocalItems();
    const created = {
      ...newItem,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalItems([created, ...local]);
    return { data: created, error: null, isDemo: true };
  }

  try {
    const { data, error } = await supabase
      .from('watchlist')
      .insert([newItem])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, isDemo: false };
  } catch (error) {
    console.warn('Supabase createWatchlistItem error:', error);
    // Fallback to local
    const local = getLocalItems();
    const created = {
      ...newItem,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalItems([created, ...local]);
    return { data: created, error, isDemo: true };
  }
}

/**
 * 3. UPDATE: Modify an existing watchlist target
 */
export async function updateWatchlistItem(id, updates) {
  if (!isSupabaseConfigured() || String(id).startsWith('demo-') || String(id).startsWith('local-')) {
    const local = getLocalItems();
    const updated = local.map((item) =>
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    saveLocalItems(updated);
    const modified = updated.find((i) => i.id === id);
    return { data: modified, error: null, isDemo: true };
  }

  try {
    const { data, error } = await supabase
      .from('watchlist')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, isDemo: false };
  } catch (error) {
    console.warn('Supabase updateWatchlistItem error:', error);
    return { data: null, error, isDemo: true };
  }
}

/**
 * 4. DELETE: Remove an item from the watchlist
 */
export async function deleteWatchlistItem(id) {
  if (!isSupabaseConfigured() || String(id).startsWith('demo-') || String(id).startsWith('local-')) {
    const local = getLocalItems();
    const filtered = local.filter((item) => item.id !== id);
    saveLocalItems(filtered);
    return { success: true, error: null, isDemo: true };
  }

  try {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null, isDemo: false };
  } catch (error) {
    console.warn('Supabase deleteWatchlistItem error:', error);
    return { success: false, error, isDemo: true };
  }
}

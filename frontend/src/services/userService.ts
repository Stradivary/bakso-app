
import { supabase } from './supabaseService';

export async function updateUserLocation(latitude: number, longitude: number) {
  const userId = localStorage.getItem('userId');

  if (userId) {
    const { error } = await supabase
      .from('users')
      .update({
        location: `SRID=4326;POINT(${longitude} ${latitude})`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user location:', error.message);
    }
  }
}

export async function getNearbySellers(
  latitude: number,
  longitude: number,
  radiusMeters: number
) {
  const { data, error } = await supabase.rpc('get_nearby_sellers', {
    user_latitude: latitude,
    user_longitude: longitude,
    radius_meters: radiusMeters,
  });

  if (error) {
    console.error('Error fetching nearby sellers:', error.message);
    return [];
  }

  return data;
}

export async function getNearbyCustomers(
  latitude: number,
  longitude: number,
  radiusMeters: number
) {
  const { data, error } = await supabase.rpc('get_nearby_customers', {
    seller_latitude: latitude,
    seller_longitude: longitude,
    radius_meters: radiusMeters,
  });

  if (error) {
    console.error('Error fetching nearby customers:', error.message);
    return [];
  }

  return data;
}

// Optionally, add a function to deactivate the user
export async function deactivateUser() {
  const userId = localStorage.getItem('userId');

  if (userId) {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false, last_seen: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error deactivating user:', error.message);
    }
  }
}
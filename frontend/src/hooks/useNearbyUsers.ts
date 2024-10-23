import { useState, useEffect } from 'react';
import { useAuth } from '../services/authService';
import { useLocation } from './useLocation';
import { User } from '../models/user';
import { supabase } from '../services/supabaseService';

export const useNearbyUsers = () => {
  const [users, setUsers] = useState<User[] | undefined>([]);
  const { user } = useAuth();
  const { location } = useLocation();

  const fetchNearbyUsers = async () => {
    if (user && location) {
      const { data } = await supabase.rpc('find_nearest_users', {
        user_id: user.id,
        user_role: user.role,
        current_lat: location.latitude,
        current_long: location.longitude,
      });
      if (!data) return [] as User[];
      const DataAsUser = data.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role as 'customer' | 'seller',
        location: {
          latitude: user.latitude,
          longitude: user.longitude,
        },
        distance: user.distance,
      }));
      setUsers(DataAsUser);
      localStorage.setItem('nearbyUsers', JSON.stringify(data));
    } else {
      const cachedUsers = localStorage.getItem('nearbyUsers');
      if (cachedUsers) {
        setUsers(JSON.parse(cachedUsers));
      }
    }
  };

  useEffect(() => {
    fetchNearbyUsers();
    const interval = setInterval(fetchNearbyUsers, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [user, location]);

  return users;
};

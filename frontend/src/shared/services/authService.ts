import { createContext, useContext } from 'react';
import { User } from '../models/user';
import { supabase } from './supabaseService';

// Constants for location handling
const LOCATION_PRECISION = 2; // Number of decimal points to keep
const MIN_DISTANCE_KM = 5; // Minimum distance between users with same role/name

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper function to normalize location coordinates
const normalizeLocation = (coord: number): number => {
  return Number(coord.toFixed(LOCATION_PRECISION));
};

// Generate a unique password based on location and role
const generateLocationBasedPassword = (
  name: string,
  role: string,
  location: { latitude: number; longitude: number; }
): string => {
  const normalizedLat = normalizeLocation(location.latitude);
  const normalizedLong = normalizeLocation(location.longitude);
  return `${name}_${role}_${normalizedLat}_${normalizedLong}`;
};

export const authService = {
  registerOrLogin: async (
    name: string,
    role: string,
    location: { latitude: number; longitude: number; }
  ): Promise<User> => {
    const normalizedLocation = {
      latitude: normalizeLocation(location.latitude),
      longitude: normalizeLocation(location.longitude),
    };

    const email = `${name.replace(/\s/g, '').toLowerCase()}@${role}.com`;
    const locationBasedPassword = generateLocationBasedPassword(name, role, normalizedLocation);

    // Check for existing users with same name and role
    const { data: existingUsers } = await supabase
      .from('users_new')
      .select('*')
      .eq('name', name)
      .eq('role', role);

    // Check distance from all existing users with same name and role
    if (existingUsers?.length) {
      const tooClose = existingUsers.some(user => {
        const userLocation = (user.location as string).replace('POINT(', '').replace(')', '').split(' ');
        const distance = calculateDistance(
          normalizedLocation.latitude,
          normalizedLocation.longitude,
          parseFloat(userLocation[1]),
          parseFloat(userLocation[0])
        );
        return distance < MIN_DISTANCE_KM;
      });

      if (tooClose) {
        throw new Error(`A user with the same name and role exists within ${MIN_DISTANCE_KM}km of this location`);
      }
    }

    // Check if exact user exists
    const { data: existingUser } = await supabase
      .from('users_new')
      .select('*')
      .eq('email', email)
      // .eq('location', `POINT(${normalizedLocation.longitude} ${normalizedLocation.latitude})`)
      .single();

    const userData = {
      id: existingUser?.id ?? "",
      email,
      name,
      role: role as "customer" | "seller",
      location: normalizedLocation,
      distance: 0
    };

    if (!existingUser) {
      // Register new user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password: locationBasedPassword
      });

      if (signUpError) throw signUpError;

      // Insert new user data
      const { error: insertError } = await supabase.from('users_new').insert([
        {
          id: user?.id ?? "",
          email,
          name,
          role: role === 'customer' ? 'customer' : 'seller',
          location: `SRID=4326;POINT(${normalizedLocation.longitude} ${normalizedLocation.latitude})`,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
      ]);

      if (insertError) throw insertError;

      userData.id = user?.id ?? "";
    } else {
      // Update last login time
      await supabase
        .from('users_new')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', existingUser.id);
    }

    return userData;
  },

  // Helper method to verify if a location is valid for a user
  verifyLocation: async (
    name: string,
    role: string,
    location: { latitude: number; longitude: number; }
  ): Promise<boolean> => {
    const normalizedLocation = {
      latitude: normalizeLocation(location.latitude),
      longitude: normalizeLocation(location.longitude),
    };

    const { data: existingUsers } = await supabase
      .from('users_new')
      .select('*')
      .eq('name', name)
      .eq('role', role);

    if (!existingUsers?.length) return true;

    return !existingUsers.some(user => {
      const userLocation = (user.location as string).replace('POINT(', '').replace(')', '').split(' ');
      const distance = calculateDistance(
        normalizedLocation.latitude,
        normalizedLocation.longitude,
        parseFloat(userLocation[1]),
        parseFloat(userLocation[0])
      );
      return distance < MIN_DISTANCE_KM;
    });
  }
};
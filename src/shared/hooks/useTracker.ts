import { notifications as notify } from "@mantine/notifications";
import { LatLng } from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Notification, useNotifications } from './useNotification';
import { RealtimeChannel } from "@supabase/supabase-js";

const SELLER_RADIUS = 3000; // 1km in meters
const BUYER_RADIUS = 3000; // 2km in meters
const PRESENCE_UPDATE_BUFFER = 1000; // 5 seconds

interface User {
  id: string;
  user_id: string;
  role: 'seller' | 'buyer';
  location: {
    lat: number;
    lng: number;
  };
  isOnline: boolean;
  userName: string; // Added userName
  isAvailable: boolean; // Add isAvailable property
  seller_id: string;
}

export interface Channel {
  region: string;
  users: User[];
}

/**
 * Calculate region based on latitude and longitude
 */
export const calculateRegion = (lat: number, lng: number) => {
  return Buffer.from(`${Math.floor(lat * 10)}-${Math.floor(lng * 10)}`).toString('base64');
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (point1: LatLng, point2: LatLng) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Filter nearby users based on current location and user role
 * - Sellers can only see buyers within 1km radius
 * - Buyers can only see sellers within 2km radius
 * - Buyers can ping a specific seller
 * - Sellers will receive ping events
 * - Sellers can update their location and will broadcast their location
 * - Sellers will reconnect to a new region if they move
 * - Buyers will receive location updates
 */
const filterNearbyUsers = (
  users: User[],
  currentLocation: LatLng,
  userRole: 'seller' | 'buyer',
  userId?: string
) => {
  // if users is in the same position, add +0.0001 to the lat, lng

  const preventSamePosition = (users: User[]) => {
    const newUsers = users;
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        if (users[i].location.lat === users[j].location.lat && users[i].location.lng === users[j].location.lng) {
          newUsers[j].location.lat += 0.01;
          newUsers[j].location.lng += 0.01;
        }
      }
    }
    return newUsers;
  };

  const userss = preventSamePosition(users).filter((user) => {
    if (user.id === userId) return false; // Exclude self

    // Exclude buyers who are not available
    if (user.role === 'buyer' && !user.isAvailable) {
      if (user.seller_id === userId) {
        return true;
      } else {
        return false;
      }
    };

    const distance = calculateDistance(
      currentLocation,
      new LatLng(user.location.lat, user.location.lng)
    );


    if (userRole === 'buyer') {
      // TODO: Only show the selected seller 
      // if (selectedSeller) { 
      //   return user.id === selectedSeller;
      // }
      // Buyers see sellers within radius
      return user.role === 'seller' && distance <= BUYER_RADIUS;
    } else if (userRole === 'seller') {
      // Sellers see available buyers within radius
      return user.role === 'buyer' && distance <= SELLER_RADIUS && user.isAvailable;
    }
    return false;

  });
  return userss;
};

export const useLocationTracking = (
  userId: string,
  userRole: 'seller' | 'buyer',
  initialLocation: LatLng,
  userName: string // Added userName parameter
) => {
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [lastPingTime, setLastPingTime] = useState<number>(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const regionRef = useRef<string>('');
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const { markAsRead } = useNotifications(userId, localNotifications); // Pass localNotifications
  const presenceUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addNotification = useCallback((buyerId: string, buyerName: string) => {
    const newNotification = {
      buyer_id: buyerId,
      created_at: new Date().toISOString(),
      expiry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      id: `${buyerId}-${Date.now()}`,
      seller_id: userId,
      is_read: false,
      buyerName
    };
    setLocalNotifications((prev) => [...prev, newNotification]);

    // Remove notification after 5 minutes
    setTimeout(() => {
      setLocalNotifications((prev) =>
        prev.filter((notification) => notification.id !== newNotification.id)
      );
    }, 5 * 60 * 1000);
  }, [userId]);



  // Initialize the Supabase channel subscription when userId or userRole changes
  useEffect(() => {
    if (!initialLocation.lat || !initialLocation.lng) {
      return;
    }
    const initChannel = async () => {
      const region = calculateRegion(initialLocation.lat, initialLocation.lng);
      regionRef.current = region;

      const channel = supabase.channel(`${region}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Handle presence state changes
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<User>();
        const users = Object.values(state).flat() as User[];
        if (presenceUpdateTimerRef.current) {
          clearTimeout(presenceUpdateTimerRef.current);
        }
        presenceUpdateTimerRef.current = setTimeout(() => {
          const filtered = filterNearbyUsers(users, initialLocation, userRole, userId);
          setNearbyUsers(filtered);
        }, PRESENCE_UPDATE_BUFFER);
      });

      // Handle ping events
      channel.on('broadcast', { event: 'ping' }, (payload) => {
        const { seller_id, buyer_name, buyer_id } = payload.payload;
        if (seller_id === userId) {
          addNotification(buyer_id, buyer_name);
        }
      });

      // Handle location updates
      channel.on('broadcast', { event: 'location' }, (payload) => {
        const { user_id, location } = payload.payload;
        setNearbyUsers((prev) =>
          prev.map((user) =>
            user.id === user_id
              ? {
                ...user,
                location: location !== undefined ? location : user.location,
              }
              : user
          )
        );
      });

      await channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            role: userRole,
            location: {
              lat: initialLocation.lat,
              lng: initialLocation.lng,
            },
            isOnline: true,
            userName: userName,
            isAvailable: true,
          });
        }
      });

      channelRef.current = channel;
    };

    initChannel();

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }

      if (presenceUpdateTimerRef.current) {
        clearTimeout(presenceUpdateTimerRef.current);
      }
    };
  }, [userId, userRole, userName, addNotification, initialLocation]);

  // Update location (for sellers only)
  const updateLocation = async (newLocation: LatLng) => {
    if (userRole !== 'seller' || !channelRef.current) return;

    const newRegion = calculateRegion(newLocation.lat, newLocation.lng);

    if (newRegion !== regionRef.current) {
      regionRef.current = newRegion;
    }

    await channelRef.current.track({
      user_id: userId,
      role: userRole,
      location: {
        lat: newLocation.lat,
        lng: newLocation.lng,
      },
      isOnline: true,
      userName: userName,
      isAvailable: true,
    });
  };


  // Ping seller (for buyers only)
  const pingSeller = async (sellerId: string) => {
    if (userRole !== 'buyer' || !channelRef.current) return;

    // Rate limiting: Only allow ping once every 5 minutes
    if (Date.now() - lastPingTime < 5 * 60 * 1000) {
      notify.show({
        title: 'Colek', message: 'Anda sudah mencolek tukang bakso. Tunggu sebentar ya.'
      });
      return;
    }
    setLastPingTime(Date.now());

    setSelectedSeller(sellerId);

    // Update buyer's availability
    await channelRef.current.track({
      user_id: userId,
      role: userRole,
      location: {
        lat: initialLocation.lat,
        lng: initialLocation.lng,
      },
      isOnline: true,
      userName: userName,
      isAvailable: false, // Set buyer as not available
      seller_id: sellerId
    });

    // Send ping to seller
    await channelRef.current.send({
      type: 'broadcast',
      event: 'ping',
      payload: {
        buyer_id: userId,
        seller_id: sellerId,
        buyer_name: userName
      },
    });

    // Update nearby users to only show selected seller
    setNearbyUsers((prev) => prev.filter(user => user.id === sellerId));
  };

  const deactivateUser = async () => {
    if (channelRef.current) {
      await channelRef.current.untrack();
      await channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return {
    currentRegion: regionRef.current,
    nearbyUsers,
    selectedSeller,
    updateLocation,
    pingSeller,
    deactivateUser,
    notifications: localNotifications,
    markAsRead,
  };
};
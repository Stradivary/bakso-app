import React from 'react';
import { Card, Text } from '@mantine/core';
import { User } from '../models/user';

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => (
  <Card>
    <Text>{user.name}</Text>
    <Text>{user.distance.toFixed(2)} meters away</Text>
  </Card>
);

export default UserCard;

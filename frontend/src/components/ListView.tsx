import React from 'react'; 
import { User } from '../models/user';
import UserCard from './UserCard';

interface ListViewProps {
  users?: User[];
}

const ListView: React.FC<ListViewProps> = ({ users = [] }) => (
  <div>
    {users.map((user) => (
      <UserCard key={user.id} user={user} />
    ))}
  </div>
);

export default ListView;

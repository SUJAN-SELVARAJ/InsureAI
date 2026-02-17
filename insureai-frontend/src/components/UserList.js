import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/api';
import './UserList.css';

const UserList = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setMessage('❌ Failed to fetch users');
      setLoading(false);
    }
  };

  return (
    <div className="userlist-container">
      <div className="userlist-header">
        <h1>👥 All Users</h1>
        <div className="header-right">
          <span>Welcome, <strong>{currentUser?.email}</strong></span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p className="loading">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="no-users">No users found</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={fetchUsers} className="refresh-btn">🔄 Refresh</button>
    </div>
  );
};

export default UserList;
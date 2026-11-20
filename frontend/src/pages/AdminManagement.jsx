import React, { useState, useEffect } from 'react';
import { Trash2, Search, UserCheck, RefreshCw, Users } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';
import { EmptyState } from '../components/ui';

export default function AdminManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await api.getAdminUsers();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
    const interval = setInterval(() => fetchUsers(false), 8000);
    const handleFocus = () => fetchUsers(false);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleToggleStatus = async (userId, currentStatus, accountRole) => {
    if (accountRole === 'admin') {
      alert('Cannot change status of primary Administrator account.');
      return;
    }
    try {
      await api.toggleAdminUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, active_status: currentStatus === 1 ? 0 : 1 } : u
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteUser = async (userId, accountRole) => {
    if (accountRole === 'admin') {
      alert('Cannot delete the primary Administrator account.');
      return;
    }
    if (!window.confirm(`Permanently delete User #${userId}?`)) return;
    try {
      await api.deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.account_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout admin>
      <Page
        title="Manage Users"
        subtitle="View, monitor, and manage registered candidates and administrators in MySQL"
        action={
          <button className="btn outline" onClick={() => fetchUsers(true)}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      >
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div className="input-icon" style={{ flex: '1 1 220px', maxWidth: 320 }}>
              <Search size={15} />
              <input
                type="text"
                className="input"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 160 }}
            >
              <option value="all">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={22} className="spin" />
              <p>Loading users from MySQL database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No users found." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>USER ID</th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>RESUME</th>
                    <th>STATUS</th>
                    <th>JOINED</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const joined = u.created_at
                      ? new Date(u.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '—';
                    const isAdmin = u.account_role === 'admin';
                    return (
                      <tr key={u.user_id}>
                        <td className="muted num" style={{ fontWeight: 700 }}>#{u.user_id}</td>
                        <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`pill ${isAdmin ? 'info' : 'neutral'}`} style={{ textTransform: 'capitalize' }}>
                            {u.account_role}
                          </span>
                        </td>
                        <td>
                          {u.has_resume ? (
                            <span className="pill good">✓ Uploaded</span>
                          ) : (
                            <span className="muted text-xs">None</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                            style={{ background: 'transparent', border: 0, padding: 0, cursor: isAdmin ? 'default' : 'pointer' }}
                            title={isAdmin ? 'Admin status cannot be changed' : 'Click to toggle status'}
                          >
                            <span className={`pill ${u.active_status === 1 ? 'good' : 'bad'}`}>
                              {u.active_status === 1 ? '● Active' : '○ Inactive'}
                            </span>
                          </button>
                        </td>
                        <td className="muted text-xs">{joined}</td>
                        <td>
                          <div className="row-gap" style={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
                            <button
                              className="btn outline small"
                              onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                              disabled={isAdmin}
                              title="Toggle Status"
                            >
                              <UserCheck size={13} />
                            </button>
                            <button
                              className="btn outline small danger"
                              onClick={() => handleDeleteUser(u.user_id, u.account_role)}
                              disabled={isAdmin}
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Page>
    </Layout>
  );
}

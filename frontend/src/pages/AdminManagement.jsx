import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Plus, Search, UserCheck, RefreshCw, Users } from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';

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
          <button className="btn outline" onClick={() => fetchUsers(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      >
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, color: '#94a3b8' }} />
              <input
                type="text"
                className="input"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, height: 36, width: 240 }}
              />
            </div>

            <select
              className="select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ fontSize: 13, height: 36 }}
            >
              <option value="all">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              Loading users from MySQL database...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              No users found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>USER ID</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>NAME</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>EMAIL</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>ROLE</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>RESUME</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>STATUS</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569' }}>JOINED</th>
                    <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#475569', textAlign: 'center' }}>ACTIONS</th>
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
                    return (
                      <tr key={u.user_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                          #{u.user_id}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--navy, #0f172a)' }}>
                          {u.full_name}
                        </td>
                        <td style={{ padding: '12px', fontSize: 13, color: '#334155' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`pill ${u.account_role === 'admin' ? 'blue' : 'green'}`} style={{ fontSize: 11, padding: '3px 8px', textTransform: 'capitalize' }}>
                            {u.account_role}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {u.has_resume ? (
                            <span className="pill green" style={{ fontSize: 11, padding: '3px 8px' }}>✓ Uploaded</span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: u.account_role === 'admin' ? 'default' : 'pointer',
                              padding: 0
                            }}
                            title={u.account_role === 'admin' ? 'Admin status cannot be changed' : 'Click to toggle status'}
                          >
                            <span className={`pill ${u.active_status === 1 ? 'green' : 'red'}`} style={{ fontSize: 11, padding: '3px 8px' }}>
                              {u.active_status === 1 ? '● Active' : '○ Inactive'}
                            </span>
                          </button>
                        </td>
                        <td style={{ padding: '12px', fontSize: 12, color: '#64748b' }}>
                          {joined}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                            <button
                              className="btn outline small"
                              onClick={() => handleToggleStatus(u.user_id, u.active_status, u.account_role)}
                              disabled={u.account_role === 'admin'}
                              title="Toggle Status"
                              style={{ padding: '4px 8px' }}
                            >
                              <UserCheck size={12} />
                            </button>
                            <button
                              className="btn small"
                              onClick={() => handleDeleteUser(u.user_id, u.account_role)}
                              disabled={u.account_role === 'admin'}
                              title="Delete User"
                              style={{
                                background: u.account_role === 'admin' ? '#f1f5f9' : '#fff0f2',
                                color: u.account_role === 'admin' ? '#94a3b8' : '#ef4b5f',
                                padding: '4px 8px'
                              }}
                            >
                              <Trash2 size={12} />
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

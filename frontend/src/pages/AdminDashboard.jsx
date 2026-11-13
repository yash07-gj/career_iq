import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Layout, Page } from '../components/Layout';
import api from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError('');
    try {
      const data = await api.getAdminUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setActionError(err.message || 'Failed to load user records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.toggleUserStatus(user.user_id);
      if (res && res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user.user_id
              ? { ...u, active_status: res.active_status }
              : u
          )
        );
        setActionMessage(`Status of ${user.full_name} updated to ${res.active_status === 1 ? 'Active' : 'Inactive'}.`);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update user status.');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.deleteAdminUser(deleteConfirmUser.user_id);
      if (res && res.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== deleteConfirmUser.user_id));
        setActionMessage(res.message || 'User deleted successfully.');
        setDeleteConfirmUser(null);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const name = (u.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const city = (u.city || '').toLowerCase();
    const targetRole = (u.target_role || '').toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      email.includes(q) ||
      city.includes(q) ||
      targetRole.includes(q);

    const matchesRole =
      roleFilter === 'All' ||
      u.account_role?.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && u.active_status === 1) ||
      (statusFilter === 'Inactive' && u.active_status === 0);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalCandidates = users.filter((u) => u.account_role === 'candidate').length;
  const totalAdmins = users.filter((u) => u.account_role === 'admin').length;
  const activeCount = users.filter((u) => u.active_status === 1).length;

  return (
    <Layout admin>
      <Page
        title="All User Details"
        subtitle="Live user management console connected to MySQL database"
        action={
          <button
            type="button"
            className="btn outline"
            onClick={fetchUsers}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
            title="Refresh user records from database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      >
        {/* STATS HEADER CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Total Registered Users</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy, #0f172a)' }}>{users.length}</div>
            </div>
          </div>

          <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Active Candidates</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#047857' }}>{totalCandidates}</div>
            </div>
          </div>

          <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Admin Accounts</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#6d28d9' }}>{totalAdmins}</div>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {actionMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            <CheckCircle2 size={16} />
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="card card-pad">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: 12,
              marginBottom: 20,
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, color: '#8ba0b6', pointerEvents: 'none' }} />
              <input
                className="input"
                style={{ paddingLeft: 38, width: '100%' }}
                placeholder="Search by user name, email, target role, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="admin">Administrators</option>
            </select>

            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active Users</option>
              <option value="Inactive">Inactive Users</option>
            </select>

            <span className="pill blue" style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700 }}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Found
            </span>
          </div>

          {/* USERS TABLE */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div>Fetching user records from MySQL database...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              No user accounts found matching your search criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line, #e2e8f0)', fontSize: 12, color: 'var(--text-muted, #64748b)' }}>
                    <th style={{ padding: '12px 14px' }}>User ID</th>
                    <th style={{ padding: '12px 14px' }}>Full Name</th>
                    <th style={{ padding: '12px 14px' }}>Email Address</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Target Career Role</th>
                    <th style={{ padding: '12px 14px' }}>Location</th>
                    <th style={{ padding: '12px 14px' }}>Registration Date</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.user_id}
                      style={{
                        borderBottom: '1px solid var(--line, #f1f5f9)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#64748b' }}>
                        #{u.user_id}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: u.account_role === 'admin' ? '#eff6ff' : '#f0fdf4',
                              color: u.account_role === 'admin' ? '#2563eb' : '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              border: `1px solid ${u.account_role === 'admin' ? '#bfdbfe' : '#bbf7d0'}`,
                              flexShrink: 0,
                            }}
                          >
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--navy, #0f172a)', fontSize: 13, display: 'block' }}>
                              {u.full_name}
                            </strong>
                            {u.phone !== 'Not provided' && (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>{u.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text, #334155)' }}>
                        {u.email}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span
                          className={`pill ${u.account_role === 'admin' ? 'blue' : 'green'}`}
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {u.account_role}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#475569' }}>
                        {u.target_role !== 'Not set' ? (
                          <span style={{ fontWeight: 600, color: 'var(--blue, #2563eb)' }}>{u.target_role}</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not specified</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#64748b' }}>
                        {u.city}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b' }}>
                        {u.created_at}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Click to toggle status"
                        >
                          <span
                            className={`pill ${u.active_status === 1 ? 'green' : 'red'}`}
                            style={{ fontSize: 11, padding: '3px 8px', fontWeight: 600 }}
                          >
                            {u.active_status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="btn outline small"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowModal(true);
                            }}
                            title="View complete user details"
                            style={{ padding: '5px 8px' }}
                          >
                            <Eye size={13} />
                          </button>

                          {u.email !== 'admin@careeriq.com' && (
                            <button
                              type="button"
                              className="btn small"
                              onClick={() => setDeleteConfirmUser(u)}
                              title="Delete user"
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                padding: '5px 8px',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* USER DETAILS MODAL */}
        {showModal && selectedUser && (
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: 520,
                padding: 24,
                borderRadius: 14,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                background: 'var(--bg-card, #ffffff)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--line, #f1f5f9)', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: selectedUser.account_role === 'admin' ? '#eff6ff' : '#ecfdf5',
                      color: selectedUser.account_role === 'admin' ? '#2563eb' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--navy, #0f172a)' }}>
                      {selectedUser.full_name}
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--text-muted, #64748b)' }}>User ID: #{selectedUser.user_id}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <Mail size={15} color="#64748b" />
                  <strong>Email:</strong>
                  <span>{selectedUser.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <ShieldCheck size={15} color="#64748b" />
                  <strong>Account Role:</strong>
                  <span className={`pill ${selectedUser.account_role === 'admin' ? 'blue' : 'green'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                    {selectedUser.account_role}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <Briefcase size={15} color="#64748b" />
                  <strong>Target Career Role:</strong>
                  <span>{selectedUser.target_role}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <Phone size={15} color="#64748b" />
                  <strong>Phone:</strong>
                  <span>{selectedUser.phone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <MapPin size={15} color="#64748b" />
                  <strong>City / Location:</strong>
                  <span>{selectedUser.city}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <Calendar size={15} color="#64748b" />
                  <strong>Registered On:</strong>
                  <span>{selectedUser.created_at}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                  <CheckCircle2 size={15} color={selectedUser.active_status === 1 ? '#10b981' : '#ef4444'} />
                  <strong>Account Status:</strong>
                  <span className={`pill ${selectedUser.active_status === 1 ? 'green' : 'red'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                    {selectedUser.active_status === 1 ? 'Active Account' : 'Inactive Account'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button type="button" className="btn small" onClick={() => setShowModal(false)} style={{ padding: '8px 18px' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmUser && (
          <div
            onClick={() => setDeleteConfirmUser(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: 440,
                padding: 24,
                borderRadius: 14,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                background: 'var(--bg-card, #ffffff)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#b91c1c' }}>Delete User Account</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted, #64748b)' }}>This action will permanently delete user from MySQL</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 20px', lineHeight: 1.5 }}>
                Are you sure you want to delete user <strong>{deleteConfirmUser.full_name}</strong> (<code>{deleteConfirmUser.email}</code>)?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn outline small"
                  onClick={() => setDeleteConfirmUser(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn small"
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none' }}
                >
                  {actionLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Page>
    </Layout>
  );
}

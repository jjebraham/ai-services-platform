import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, kycFilter, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      // Mock data for demonstration
      setUsers([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'user',
          status: 'active',
          kycStatus: 'approved',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-20T14:22:00Z',
          totalOrders: 15,
          totalSpent: 450.75
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'user',
          status: 'active',
          kycStatus: 'pending',
          createdAt: '2024-01-18T09:15:00Z',
          lastLogin: '2024-01-21T11:45:00Z',
          totalOrders: 8,
          totalSpent: 220.50
        },
        {
          _id: '3',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          kycStatus: 'approved',
          createdAt: '2024-01-01T08:00:00Z',
          lastLogin: '2024-01-21T16:30:00Z',
          totalOrders: 0,
          totalSpent: 0
        },
        {
          _id: '4',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          role: 'user',
          status: 'suspended',
          kycStatus: 'rejected',
          createdAt: '2024-01-10T12:20:00Z',
          lastLogin: '2024-01-19T10:15:00Z',
          totalOrders: 3,
          totalSpent: 89.25
        }
      ]);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      // Mock API call
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, status: action === 'activate' ? 'active' : 'suspended' }
          : user
      ));
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      alert(`Error ${action} user. Please try again.`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    try {
      // Mock bulk action
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user._id)
          ? { ...user, status: action === 'activate' ? 'active' : 'suspended' }
          : user
      ));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action. Please try again.');
    }
  };

  const handleExportUsers = async () => {
    try {
      // Mock export functionality
      const csvContent = [
        'Name,Email,Role,Status,KYC Status,Created At,Total Orders,Total Spent',
        ...users.map(user => 
          `${user.name},${user.email},${user.role},${user.status},${user.kycStatus},${user.createdAt},${user.totalOrders},${user.totalSpent}`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Error exporting users. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active', icon: '✅' },
      suspended: { color: 'red', label: 'Suspended', icon: '🚫' },
      pending: { color: 'yellow', label: 'Pending', icon: '⏳' }
    };

    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getKYCBadge = (status) => {
    const statusConfig = {
      approved: { color: 'green', label: 'Verified', icon: '✅' },
      pending: { color: 'yellow', label: 'Pending', icon: '⏳' },
      rejected: { color: 'red', label: 'Rejected', icon: '❌' },
      not_started: { color: 'gray', label: 'Not Started', icon: '⚪' }
    };

    const config = statusConfig[status] || statusConfig.not_started;
    
    return (
      <span className={`kyc-badge ${config.color}`}>
        <span className="kyc-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'purple', label: 'Admin', icon: '🛡️' },
      user: { color: 'blue', label: 'User', icon: '👤' }
    };

    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`role-badge ${config.color}`}>
        <span className="role-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesKYC = kycFilter === 'all' || user.kycStatus === kycFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesKYC && matchesRole;
  });

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-text">
              <h1>User Management</h1>
              <p>Manage users, roles, and permissions</p>
            </div>
            <div className="header-actions">
              <button onClick={handleExportUsers} className="btn btn-secondary">
                <span className="btn-icon">📥</span>
                Export Users
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{users.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Users</h3>
              <p className="stat-number">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <h3>KYC Verified</h3>
              <p className="stat-number">{users.filter(u => u.kycStatus === 'approved').length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <div className="stat-content">
              <h3>Admins</h3>
              <p className="stat-number">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="filters-content">
            <div className="search-group">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All KYC</option>
                <option value="approved">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="not_started">Not Started</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-info">
              <span>{selectedUsers.length} user(s) selected</span>
            </div>
            <div className="bulk-buttons">
              <button 
                onClick={() => handleBulkAction('activate')}
                className="btn btn-success"
              >
                Activate Selected
              </button>
              <button 
                onClick={() => handleBulkAction('suspend')}
                className="btn btn-danger"
              >
                Suspend Selected
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="table-section">
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="table-checkbox"
                    />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>KYC</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="table-checkbox"
                      />
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>{getKYCBadge(user.kycStatus)}</td>
                    <td className="text-center">{user.totalOrders}</td>
                    <td>{formatCurrency(user.totalSpent)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      <div className="action-buttons">
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleUserAction(user._id, 'suspend')}
                            className="action-btn danger"
                            title="Suspend User"
                          >
                            🚫
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user._id, 'activate')}
                            className="action-btn success"
                            title="Activate User"
                          >
                            ✅
                          </button>
                        )}
                        <button
                          className="action-btn primary"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          className="action-btn secondary"
                          title="Edit User"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">No users found</h3>
            <p className="empty-description">
              {searchTerm || statusFilter !== 'all' || kycFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users have been registered yet'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;


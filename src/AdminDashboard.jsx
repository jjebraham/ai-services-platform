import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Filter
} from 'lucide-react';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingTickets: 0,
      pendingKYC: 0,
      activeServices: 0
    },
    recentOrders: [],
    recentUsers: [],
    recentTickets: [],
    pendingKYC: [],
    chartData: {
      revenue: [],
      orders: [],
      users: []
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse, usersResponse, ticketsResponse, kycResponse] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: {} })),
        api.get('/admin/orders?limit=5').catch(() => ({ data: [] })),
        api.get('/admin/users?limit=5').catch(() => ({ data: [] })),
        api.get('/admin/tickets?status=open&limit=5').catch(() => ({ data: [] })),
        api.get('/admin/kyc?status=pending&limit=5').catch(() => ({ data: [] }))
      ]);

      setDashboardData({
        stats: {
          totalUsers: statsResponse.data.totalUsers || 0,
          totalOrders: statsResponse.data.totalOrders || 0,
          totalRevenue: statsResponse.data.totalRevenue || 0,
          pendingTickets: statsResponse.data.pendingTickets || 0,
          pendingKYC: statsResponse.data.pendingKYC || 0,
          activeServices: statsResponse.data.activeServices || 0
        },
        recentOrders: ordersResponse.data,
        recentUsers: usersResponse.data,
        recentTickets: ticketsResponse.data,
        pendingKYC: kycResponse.data,
        chartData: statsResponse.data.chartData || { revenue: [], orders: [], users: [] }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status, type = 'order') => {
    const configs = {
      order: {
        pending: { color: 'yellow', label: 'Pending' },
        processing: { color: 'blue', label: 'Processing' },
        completed: { color: 'green', label: 'Completed' },
        failed: { color: 'red', label: 'Failed' },
        cancelled: { color: 'gray', label: 'Cancelled' }
      },
      kyc: {
        pending: { color: 'yellow', label: 'Pending' },
        approved: { color: 'green', label: 'Approved' },
        rejected: { color: 'red', label: 'Rejected' }
      },
      ticket: {
        open: { color: 'blue', label: 'Open' },
        in_progress: { color: 'yellow', label: 'In Progress' },
        resolved: { color: 'green', label: 'Resolved' },
        closed: { color: 'gray', label: 'Closed' }
      }
    };

    const config = configs[type][status] || configs[type].pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your AI services platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(dashboardData.stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.pendingTickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.pendingKYC}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Services</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.activeServices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and manage user accounts</p>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-500">Process and track orders</p>
              </div>
            </Link>

            <Link
              to="/admin/services"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Services</p>
                <p className="text-sm text-gray-500">Configure AI services</p>
              </div>
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Platform configuration</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                <Link
                  to="/admin/orders"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <div key={order._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </p>
                          {getStatusBadge(order.status, 'order')}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.service?.name} • {order.user?.email}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending KYC */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Pending KYC Reviews</h2>
                <Link
                  to="/admin/kyc"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboardData.pendingKYC.length > 0 ? (
                dashboardData.pendingKYC.map((kyc) => (
                  <div key={kyc._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {kyc.user?.firstName} {kyc.user?.lastName}
                          </p>
                          {getStatusBadge(kyc.status, 'kyc')}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {kyc.user?.email}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Submitted: {formatDate(kyc.createdAt)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/admin/kyc/${kyc._id}`}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No pending KYC reviews</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
                <Link
                  to="/admin/users"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboardData.recentUsers.length > 0 ? (
                dashboardData.recentUsers.map((user) => (
                  <div key={user._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Joined: {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent users</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Support Tickets */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Support Tickets</h2>
                <Link
                  to="/admin/tickets"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboardData.recentTickets.length > 0 ? (
                dashboardData.recentTickets.map((ticket) => (
                  <div key={ticket._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            #{ticket.ticketNumber}
                          </p>
                          {getStatusBadge(ticket.status, 'ticket')}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticket.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticket.user?.email} • {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/admin/tickets/${ticket._id}`}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent tickets</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


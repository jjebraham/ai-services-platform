import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);
        const response = await userAPI.getDashboardData();
        setDashboardData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoadingData(false);
      }
    };

    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertTitle>Not Authenticated</AlertTitle>
        <AlertDescription>Please log in to view your dashboard.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.profile.firstName || user.email}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.kyc?.status || 'Not Submitted'}</div>
            {user.kyc?.status === 'pending' && (
              <p className="text-xs text-muted-foreground">Review in progress</p>
            )}
            {user.kyc?.status === 'rejected' && (
              <p className="text-xs text-muted-foreground">Please resubmit KYC. <Link to="/dashboard/kyc" className="text-primary hover:underline">Resubmit</Link></p>
            )}
            {user.kyc?.status === 'approved' && (
              <p className="text-xs text-muted-foreground">Your KYC is approved!</p>
            )}
            {(!user.kyc || user.kyc.status === 'not_submitted') && (
              <Button asChild className="mt-2">
                <Link to="/dashboard/kyc">Complete KYC</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.balance?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <ul className="space-y-2">
                {dashboardData.recentOrders.map((order) => (
                  <li key={order._id} className="flex justify-between items-center">
                    <span>{order.serviceName} - {order.quantity} units</span>
                    <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent orders.</p>
            )}
            <Button variant="link" asChild className="px-0 mt-4">
              <Link to="/dashboard/orders">View all orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentTickets && dashboardData.recentTickets.length > 0 ? (
              <ul className="space-y-2">
                {dashboardData.recentTickets.map((ticket) => (
                  <li key={ticket._id} className="flex justify-between items-center">
                    <span>{ticket.title}</span>
                    <span className="font-semibold capitalize">{ticket.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent tickets.</p>
            )}
            <Button variant="link" asChild className="px-0 mt-4">
              <Link to="/dashboard/support">View all tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;



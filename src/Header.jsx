import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  User,
  Settings,
  LogOut,
  Menu,
  ShoppingCart,
  HeadphonesIcon,
  Shield,
  LayoutDashboard,
  Zap,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

function Header() {
  const { user, isAuthenticated, logout, isAdmin, hasCompletedKYC } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    { name: 'Home', href: '/', public: true },
    { name: 'Services', href: '/services', public: true },
    { name: 'Dashboard', href: '/dashboard', protected: true },
    { name: 'Orders', href: '/dashboard/orders', protected: true },
    { name: 'Support', href: '/dashboard/support', protected: true },
  ];

  const adminNavigationItems = [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Services', href: '/admin/services', icon: Zap },
    { name: 'Tickets', href: '/admin/tickets', icon: HeadphonesIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={theme === 'dark' ? '/kiani-exchange-logo-white.svg' : '/kiani-exchange-logo-gray.svg'}
              alt="KIANI.EXCHANGE"
              className="h-4"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              if (item.protected && !isAuthenticated) return null;
              if (item.public || isAuthenticated) {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActivePath(item.href)
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              }
              return null;
            })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive"></span>
                </Button>

                {/* Admin Menu */}
                {isAdmin() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {adminNavigationItems.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link to={item.href} className="flex items-center">
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profile?.avatar} alt={user?.email} />
                        <AvatarFallback>
                          {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          {!user?.emailVerified && (
                            <Badge variant="destructive" className="text-xs">
                              Email not verified
                            </Badge>
                          )}
                          {!hasCompletedKYC() && (
                            <Badge variant="outline" className="text-xs">
                              KYC pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/orders">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/support">
                        <HeadphonesIcon className="mr-2 h-4 w-4" />
                        <span>Support</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    Access all features and settings
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Navigation Items */}
                  {navigationItems.map((item) => {
                    if (item.protected && !isAuthenticated) return null;
                    if (item.public || isAuthenticated) {
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActivePath(item.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-primary hover:bg-muted'
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    }
                    return null;
                  })}

                  {/* Auth Buttons for Mobile */}
                  {!isAuthenticated && (
                    <div className="space-y-2 pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Admin Menu for Mobile */}
                  {isAuthenticated && isAdmin() && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground px-3">
                        Admin Panel
                      </h4>
                      {adminNavigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-muted"
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* User Actions for Mobile */}
                  {isAuthenticated && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium">
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;


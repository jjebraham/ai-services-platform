import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Shield,
  CreditCard,
  HeadphonesIcon,
  ArrowRight,
  CheckCircle,
  Brain,
  Image,
  Code,
  BarChart3,
  Globe,
  Users,
} from 'lucide-react';

function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'KYC verification and secure payment processing ensure your safety and compliance.',
    },
    {
      icon: CreditCard,
      title: 'Real-time Pricing',
      description: 'Live USD to Toman conversion with transparent pricing and no hidden fees.',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Dedicated customer support team ready to help you with any questions.',
    },
    {
      icon: Zap,
      title: 'Premium Services',
      description: 'Access to cutting-edge AI services from leading providers worldwide.',
    },
  ];

  const services = [
    {
      icon: Brain,
      title: 'Language Models',
      description: 'Advanced AI language models for text generation, analysis, and conversation.',
      badge: 'Popular',
    },
    {
      icon: Image,
      title: 'Image Generation',
      description: 'Create stunning images and artwork using state-of-the-art AI models.',
      badge: 'New',
    },
    {
      icon: Code,
      title: 'Code Execution',
      description: 'Run and execute code in various programming languages safely.',
      badge: null,
    },
    {
      icon: BarChart3,
      title: 'Data Analysis',
      description: 'Powerful data processing and analysis tools for insights and visualization.',
      badge: null,
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'AI Services', value: '50+' },
    { label: 'Countries', value: '25+' },
    { label: 'Uptime', value: '99.9%' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Trusted by 10,000+ users worldwide
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Access Premium{' '}
                <span className="text-primary">AI Services</span>{' '}
                with Confidence
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your gateway to cutting-edge AI tools and services. Secure payments, 
                verified providers, and dedicated support for all your AI needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/auth/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/services">Browse Services</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground">
              We provide a secure, reliable, and user-friendly platform for accessing 
              premium AI services from around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-sm">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Explore AI Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover a wide range of AI services from leading providers, 
              all available through our secure platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    {service.badge && (
                      <Badge variant={service.badge === 'Popular' ? 'default' : 'secondary'}>
                        {service.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {service.description}
                  </CardDescription>
                  <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/services">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Join thousands of users who trust our platform for their AI service needs. 
              Start your journey today with our secure and reliable platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/auth/register">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                    <Link to="/auth/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8 text-sm text-primary-foreground/60">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;


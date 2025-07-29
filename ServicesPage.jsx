import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { servicesAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Zap,
  Brain,
  Image,
  Code,
  BarChart3,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';

function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [exchangeRate, setExchangeRate] = useState(null);

  const categories = [
    { value: 'all', label: 'All Services', icon: Sparkles },
    { value: 'language-models', label: 'Language Models', icon: MessageSquare },
    { value: 'image-generation', label: 'Image Generation', icon: Image },
    { value: 'code-execution', label: 'Code Execution', icon: Code },
    { value: 'data-analysis', label: 'Data Analysis', icon: BarChart3 },
    { value: 'ai-tools', label: 'AI Tools', icon: Brain },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  // Mock services data for demonstration
  const mockServices = [
    {
      _id: '1',
      name: 'OpenAI GPT-4',
      description: 'Advanced language model for text generation, analysis, and conversation. Perfect for content creation, coding assistance, and complex reasoning tasks.',
      category: 'language-models',
      priceUSD: 0.03,
      unit: 'per 1K tokens',
      isActive: true,
      rating: 4.9,
      popularity: 95,
      features: ['Text Generation', 'Code Assistance', 'Analysis', 'Conversation'],
      provider: 'OpenAI',
      responseTime: '< 2s',
    },
    {
      _id: '2',
      name: 'DeepSeek Coder',
      description: 'Specialized coding assistant with advanced programming capabilities. Supports multiple languages and frameworks.',
      category: 'code-execution',
      priceUSD: 0.02,
      unit: 'per 1K tokens',
      isActive: true,
      rating: 4.7,
      popularity: 88,
      features: ['Code Generation', 'Debugging', 'Refactoring', 'Documentation'],
      provider: 'DeepSeek',
      responseTime: '< 3s',
    },
    {
      _id: '3',
      name: 'DALL-E 3',
      description: 'State-of-the-art image generation model for creating high-quality images from text descriptions.',
      category: 'image-generation',
      priceUSD: 0.08,
      unit: 'per image',
      isActive: true,
      rating: 4.8,
      popularity: 92,
      features: ['High Resolution', 'Style Control', 'Text Integration', 'Commercial Use'],
      provider: 'OpenAI',
      responseTime: '< 10s',
    },
    {
      _id: '4',
      name: 'Claude 3 Sonnet',
      description: 'Anthropic\'s advanced AI assistant for analysis, writing, and complex reasoning tasks.',
      category: 'language-models',
      priceUSD: 0.015,
      unit: 'per 1K tokens',
      isActive: true,
      rating: 4.6,
      popularity: 85,
      features: ['Long Context', 'Analysis', 'Writing', 'Safety'],
      provider: 'Anthropic',
      responseTime: '< 2s',
    },
    {
      _id: '5',
      name: 'Stable Diffusion XL',
      description: 'Open-source image generation model with excellent quality and customization options.',
      category: 'image-generation',
      priceUSD: 0.04,
      unit: 'per image',
      isActive: true,
      rating: 4.5,
      popularity: 78,
      features: ['Open Source', 'Customizable', 'Fast Generation', 'Multiple Styles'],
      provider: 'Stability AI',
      responseTime: '< 5s',
    },
    {
      _id: '6',
      name: 'Code Interpreter',
      description: 'Secure code execution environment supporting Python, JavaScript, and more programming languages.',
      category: 'code-execution',
      priceUSD: 0.01,
      unit: 'per execution',
      isActive: true,
      rating: 4.4,
      popularity: 72,
      features: ['Multi-Language', 'Secure Sandbox', 'File Support', 'Visualization'],
      provider: 'Platform',
      responseTime: '< 5s',
    },
  ];

  useEffect(() => {
    loadServices();
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, sortBy]);

  const loadServices = async () => {
    try {
      // For now, use mock data since backend connection has issues
      setServices(mockServices);
    } catch (error) {
      console.error('Failed to load services:', error);
      // Use mock data as fallback
      setServices(mockServices);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      // Mock exchange rate for demonstration
      setExchangeRate(42000); // 1 USD = 42,000 Toman
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(42000); // Fallback rate
    }
  };

  const filterAndSortServices = () => {
    let filtered = services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory && service.isActive;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceUSD - b.priceUSD;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServices(filtered);
  };

  const formatPrice = (priceUSD, unit) => {
    if (!exchangeRate) return `$${priceUSD} ${unit}`;
    const priceToman = Math.round(priceUSD * exchangeRate);
    return `${priceToman.toLocaleString()} ﷼ ${unit}`;
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : Sparkles;
  };

  const handleOrderService = (service) => {
    if (!user) {
      toast.error('Please sign in to order services');
      return;
    }
    
    // Navigate to order page (would be implemented in Phase 6)
    toast.info(`Ordering ${service.name} - Feature coming soon!`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">AI Services Catalog</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover and access premium AI services from leading providers. 
            All prices shown in Iranian Toman with real-time conversion.
          </p>
          {exchangeRate && (
            <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full text-sm">
              <DollarSign className="h-4 w-4" />
              <span>1 USD = {exchangeRate.toLocaleString()} ﷼</span>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <category.icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const CategoryIcon = getCategoryIcon(service.category);
            
            return (
              <Card key={service._id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{service.provider}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(cat => cat.value === service.category)?.label}
                    </Badge>
                  </div>

                  <CardDescription className="text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {service.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{service.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{service.responseTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Response</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{service.popularity}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Popular</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing and Action */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(service.priceUSD, service.unit)}
                      </div>
                      {exchangeRate && (
                        <div className="text-sm text-muted-foreground">
                          ${service.priceUSD} {service.unit}
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => handleOrderService(service)}
                      className="w-full group-hover:bg-primary/90 transition-colors"
                    >
                      Order Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all categories.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Why Choose Our Platform?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Secure Payments</p>
                <p className="text-muted-foreground">KYC verified transactions with multiple payment options</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Real-time Pricing</p>
                <p className="text-muted-foreground">Live USD to Toman conversion with transparent fees</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">24/7 Support</p>
                <p className="text-muted-foreground">Dedicated customer support for all your needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Clock,
  Star,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const orderSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1').max(1000, 'Maximum quantity is 1000'),
  paymentMethod: z.enum(['stripe', 'paypal'], {
    required_error: 'Please select a payment method',
  }),
});

const OrderPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(42000);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      paymentMethod: 'stripe'
    }
  });

  const quantity = watch('quantity');
  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
    fetchExchangeRate();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await api.get('/services/exchange-rate');
      setExchangeRate(response.data.rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const calculateTotal = () => {
    if (!service) return { usd: 0, toman: 0 };
    const usdTotal = service.price * quantity;
    const tomanTotal = usdTotal * exchangeRate;
    return { usd: usdTotal, toman: tomanTotal };
  };

  const formatCurrency = (amount, currency = 'IRR') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, Math.min(1000, quantity + delta));
    setValue('quantity', newQuantity);
  };

  const handleOrderSubmit = async (data) => {
    setSubmitting(true);
    try {
      const orderData = {
        serviceId: service._id,
        quantity: data.quantity,
        paymentMethod: data.paymentMethod,
        totalAmount: calculateTotal().toman
      };

      const response = await api.post('/orders', orderData);
      
      // Redirect to payment or order confirmation
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        navigate(`/orders/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-4">The requested service could not be found.</p>
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Services
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Place Order</h1>
          <p className="text-gray-600 mt-2">
            Complete your purchase for {service.name}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-500'
              }`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Order Details
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-500'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Payment
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 3 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-500'
              }`}>
                {currentStep >= 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 3 ? 'text-green-600' : 'text-gray-500'
              }`}>
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
              
              <form onSubmit={handleSubmit(handleOrderSubmit)} className="space-y-6">
                {/* Service Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {service.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{service.provider}</p>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{service.rating || 4.5}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.responseTime || '< 2s'}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>{formatCurrency(service.price, 'USD')} per {service.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity ({service.unit}s)
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      {...register('quantity', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="1000"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('paymentMethod')}
                        type="radio"
                        value="stripe"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">Credit/Debit Card</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <img src="/api/placeholder/24/16" alt="Visa" className="h-4" />
                            <img src="/api/placeholder/24/16" alt="Mastercard" className="h-4" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Secure payment via Stripe</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('paymentMethod')}
                        type="radio"
                        value="paypal"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-5 w-5 bg-blue-600 rounded mr-2"></div>
                            <span className="text-sm font-medium text-gray-900">PayPal</span>
                          </div>
                          <img src="/api/placeholder/60/16" alt="PayPal" className="h-4" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Pay with your PayPal account</p>
                      </div>
                    </label>
                  </div>
                  {errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                  )}
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Your payment information is encrypted and secure. We never store your payment details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Price</span>
                  <span className="font-medium">{formatCurrency(service.price, 'USD')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{quantity} {service.unit}s</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Exchange Rate</span>
                  <span className="font-medium">1 USD = {exchangeRate.toLocaleString()} ﷼</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal (USD)</span>
                  <span className="font-medium">{formatCurrency(total.usd, 'USD')}</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total (Toman)</span>
                  <span className="text-blue-600">{formatCurrency(total.toman)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li>• Access to {service.name}</li>
                      <li>• {quantity} {service.unit}s of usage</li>
                      <li>• 24/7 customer support</li>
                      <li>• Secure API access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By placing this order, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;


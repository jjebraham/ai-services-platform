-- Supabase Database Tables Creation Script
-- Run this in your Supabase SQL Editor

-- Create user_profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected')),
  phone TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  assigned_to UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_services table
CREATE TABLE IF NOT EXISTS public.ai_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for support_tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for ai_services
CREATE POLICY "Everyone can view active services" ON public.ai_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.ai_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing
INSERT INTO public.user_profiles (id, email, first_name, last_name, role, account_status) VALUES
  (gen_random_uuid(), 'admin@example.com', 'Admin', 'User', 'admin', 'active'),
  (gen_random_uuid(), 'john@example.com', 'John', 'Doe', 'user', 'active'),
  (gen_random_uuid(), 'jane@example.com', 'Jane', 'Smith', 'user', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample AI services
INSERT INTO public.ai_services (name, category, description, price) VALUES
  ('Text Generation', 'NLP', 'Advanced text generation using AI', 29.99),
  ('Image Recognition', 'Computer Vision', 'AI-powered image analysis', 19.99),
  ('Data Analysis', 'Analytics', 'Automated data insights', 39.99),
  ('Chatbot Service', 'Conversational AI', 'Intelligent chatbot solutions', 49.99)
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO public.orders (user_id, order_number, service_name, service_category, status, total_amount) 
SELECT 
  up.id,
  'ORD-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  'Text Generation',
  'NLP',
  CASE (RANDOM() * 4)::INT 
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'processing'
    WHEN 2 THEN 'completed'
    ELSE 'completed'
  END,
  29.99
FROM public.user_profiles up
WHERE up.role = 'user'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert sample support tickets
INSERT INTO public.support_tickets (user_id, ticket_number, subject, description, status, priority)
SELECT 
  up.id,
  'TKT-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  'Need help with service',
  'I need assistance with my recent order',
  CASE (RANDOM() * 3)::INT 
    WHEN 0 THEN 'open'
    WHEN 1 THEN 'in_progress'
    ELSE 'resolved'
  END,
  CASE (RANDOM() * 3)::INT 
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END
FROM public.user_profiles up
WHERE up.role = 'user'
LIMIT 3
ON CONFLICT DO NOTHING;
-- ============================================
-- Payment Gateway Migration — Go-to-Mart
-- Razorpay integration for customer payments
-- and rider earnings cashout (payouts)
-- ============================================

-- 1. Add Razorpay columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

-- 2. Create payments table (tracks every payment attempt)
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) NOT NULL,
  customer_id uuid REFERENCES profiles(id) NOT NULL,
  razorpay_order_id text NOT NULL,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'created', -- created, attempted, captured, failed, refunded
  method text, -- card, upi, netbanking, wallet
  error_code text,
  error_description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create rider_payouts table (tracks cashout requests)
CREATE TABLE IF NOT EXISTS rider_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id uuid REFERENCES profiles(id) NOT NULL,
  amount numeric NOT NULL,
  payout_method text NOT NULL, -- upi, bank_transfer
  account_details jsonb NOT NULL, -- { upi_id: "..." } or { account_number, ifsc, name }
  razorpay_payout_id text,
  status text DEFAULT 'requested', -- requested, processing, completed, failed, rejected
  admin_note text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_rider_payouts_rider_id ON rider_payouts(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_payouts_status ON rider_payouts(status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

-- 5. RLS for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Customers can view their own payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers can view own payments') THEN
    CREATE POLICY "Customers can view own payments" ON payments
      FOR SELECT USING (auth.uid() = customer_id);
  END IF;

  -- Service role / edge functions can insert payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert payments') THEN
    CREATE POLICY "Authenticated users can insert payments" ON payments
      FOR INSERT WITH CHECK (auth.uid() = customer_id);
  END IF;

  -- Service role / edge functions can update payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update own payments') THEN
    CREATE POLICY "Authenticated users can update own payments" ON payments
      FOR UPDATE USING (auth.uid() = customer_id);
  END IF;

  -- Admin can view all payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all payments') THEN
    CREATE POLICY "Admin can view all payments" ON payments
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;

  -- Admin can update all payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can update all payments') THEN
    CREATE POLICY "Admin can update all payments" ON payments
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- 6. RLS for rider_payouts table
ALTER TABLE rider_payouts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Riders can view their own payouts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Riders can view own payouts') THEN
    CREATE POLICY "Riders can view own payouts" ON rider_payouts
      FOR SELECT USING (auth.uid() = rider_id);
  END IF;

  -- Riders can request payouts (insert)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Riders can request payouts') THEN
    CREATE POLICY "Riders can request payouts" ON rider_payouts
      FOR INSERT WITH CHECK (auth.uid() = rider_id);
  END IF;

  -- Admin can view all payouts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all payouts') THEN
    CREATE POLICY "Admin can view all payouts" ON rider_payouts
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;

  -- Admin can update payouts (approve/reject)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can update payouts') THEN
    CREATE POLICY "Admin can update payouts" ON rider_payouts
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

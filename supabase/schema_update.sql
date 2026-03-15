-- Add new fee and distance columns to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 15,
ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rider_tip numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_distance_km numeric DEFAULT 0;

-- Create rider_earnings table
CREATE TABLE IF NOT EXISTS rider_earnings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id uuid REFERENCES profiles(id) NOT NULL,
  order_id uuid REFERENCES orders(id) NOT NULL,
  delivery_fee_earned numeric DEFAULT 0,
  tip_earned numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for rider_earnings
ALTER TABLE rider_earnings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Riders can view own earnings') THEN
    CREATE POLICY "Riders can view own earnings" ON rider_earnings FOR SELECT USING (auth.uid() = rider_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert earnings') THEN
    CREATE POLICY "Staff can insert earnings" ON rider_earnings FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'rider'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can update earnings') THEN
    CREATE POLICY "Admin can update earnings" ON rider_earnings FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

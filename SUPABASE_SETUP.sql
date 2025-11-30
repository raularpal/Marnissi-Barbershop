-- Reset: Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.daily_availability;

-- Create the appointments table
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    date_string TEXT NOT NULL, -- Format: YYYY-MM-DD
    time TEXT NOT NULL -- Format: HH:MM
);

-- Create the daily availability table (for overrides)
CREATE TABLE public.daily_availability (
    date_string TEXT NOT NULL PRIMARY KEY, -- Format: YYYY-MM-DD
    max_slots INT NOT NULL DEFAULT 2 -- 0 = Closed, 1 = One barber, 2 = Normal
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_availability ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous access (since we are using the frontend client directly)

-- APPOINTMENTS POLICIES
-- 1. Allow anyone to view appointments (needed to check availability)
CREATE POLICY "Enable read access for all users" 
ON public.appointments FOR SELECT 
USING (true);

-- 2. Allow anyone to create an appointment
CREATE POLICY "Enable insert access for all users" 
ON public.appointments FOR INSERT 
WITH CHECK (true);

-- 3. Allow anyone to delete an appointment (needed for the cancellation link)
CREATE POLICY "Enable delete access for all users" 
ON public.appointments FOR DELETE 
USING (true);

-- DAILY AVAILABILITY POLICIES
-- 1. Allow anyone to read availability
CREATE POLICY "Enable read access for availability" 
ON public.daily_availability FOR SELECT 
USING (true);

-- 2. Allow anyone (admin) to modify availability
CREATE POLICY "Enable full access for availability" 
ON public.daily_availability FOR ALL 
USING (true);

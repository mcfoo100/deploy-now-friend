
-- Create weekend_progress table
CREATE TABLE public.weekend_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekend_id TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  quality INT NOT NULL DEFAULT 0,
  time_saved INT NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  date_completed TEXT NOT NULL DEFAULT '',
  hours_spent NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, weekend_id)
);

-- Enable Row Level Security
ALTER TABLE public.weekend_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own rows
CREATE POLICY "Users can view their own progress"
  ON public.weekend_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.weekend_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.weekend_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.weekend_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_weekend_progress_updated_at
  BEFORE UPDATE ON public.weekend_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Alter public.lessons to support description and position columns
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;

-- Backfill existing rows
UPDATE public.lessons SET position = COALESCE(lesson_order, 0) WHERE position IS NULL OR position = 0;

-- Create index on course_id + position
CREATE INDEX IF NOT EXISTS idx_lessons_course_id_position ON public.lessons(course_id, position);

-- Ensure storage lectures bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('lectures', 'lectures', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read access to lectures'
    ) THEN
        CREATE POLICY "Allow public read access to lectures" ON storage.objects FOR SELECT USING (bucket_id = 'lectures');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to upload lectures'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload lectures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lectures');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to update/delete lectures'
    ) THEN
        CREATE POLICY "Allow authenticated users to update/delete lectures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lectures');
    END IF;
END
$$;

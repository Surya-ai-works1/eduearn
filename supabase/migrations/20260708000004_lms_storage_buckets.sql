-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-videos', 'course-videos', true),
  ('documents', 'documents', true),
  ('assignments', 'assignments', true),
  ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for all storage buckets
DO $$
DECLARE
    bucket_name TEXT;
    buckets TEXT[] := ARRAY['avatars', 'course-thumbnails', 'course-videos', 'documents', 'assignments', 'certificates'];
BEGIN
    FOREACH bucket_name IN ARRAY buckets LOOP
        -- Select Policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read access to ' || bucket_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L)', 'Allow public read access to ' || bucket_name, bucket_name);
        END IF;

        -- Insert Policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to upload to ' || bucket_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L)', 'Allow authenticated users to upload to ' || bucket_name, bucket_name);
        END IF;

        -- Update/Delete Policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to modify in ' || bucket_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L)', 'Allow authenticated users to modify in ' || bucket_name, bucket_name);
        END IF;
    END LOOP;
END
$$;

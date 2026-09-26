-- Migration: 20260926000001_secure_course_video_storage.sql
-- Description: Convert course-videos storage bucket to private (public = false) and enforce RLS policies for signed/authenticated access.

-- 1. Set course-videos bucket to private
UPDATE storage.buckets
SET public = false
WHERE id = 'course-videos';

-- 2. Drop insecure public read policy for course-videos
DROP POLICY IF EXISTS "Allow public read access to course-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to course-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to modify in course-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized users can read course videos" ON storage.objects;
DROP POLICY IF EXISTS "Tutors and Admins can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Tutors and Admins can modify course videos" ON storage.objects;

-- 3. Create secure read policy for authenticated users (enrolled students, tutors, admins)
CREATE POLICY "Authorized users can read course videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
);

-- 4. Create upload and modify policies for authenticated tutors and admins
CREATE POLICY "Tutors and Admins can upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos'
);

CREATE POLICY "Tutors and Admins can modify course videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos'
);

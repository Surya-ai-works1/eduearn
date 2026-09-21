import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrollmentService } from '@/lib/services/enrollmentService';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      const enrollment = await enrollmentService.getEnrollment(user.id, courseId);
      return NextResponse.json({ enrollment });
    }

    const enrollments = await enrollmentService.getEnrollments(user.id);
    return NextResponse.json({ enrollments });
  } catch (err: any) {
    console.error('Failed to get enrollment:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileErr) {
      console.warn("Could not load user profile for role verification:", profileErr);
    }
    
    // Default to student if profile doesn't explicitly block it (in case profile table sync delay)
    if (profile && profile.role && profile.role !== 'student') {
      return NextResponse.json({ error: 'Only student accounts can enroll in courses' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId } = body;
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    // SECURITY AUTHORITATIVE PRICING CHECK:
    // Never trust client-provided price or payment status in body.
    // Query database for exact product price.
    let isFree = false;
    let productFound = false;

    // 1. Check courses table
    const { data: dbCourse } = await supabase
      .from('courses')
      .select('id, base_price, selling_price')
      .eq('id', courseId)
      .maybeSingle();

    if (dbCourse) {
      productFound = true;
      const selling = Number(dbCourse.selling_price ?? dbCourse.base_price ?? 0);
      const base = Number(dbCourse.base_price ?? 0);
      isFree = selling === 0 || base === 0;
    } else {
      // 2. Check projects table
      const { data: dbProject } = await supabase
        .from('projects')
        .select('id, learning_fee, hardware_cost')
        .eq('id', courseId)
        .maybeSingle();

      if (dbProject) {
        productFound = true;
        const totalCost = Number(dbProject.learning_fee ?? 0) + Number(dbProject.hardware_cost ?? 0);
        isFree = totalCost === 0;
      } else {
        // 3. Check career_packages table
        const { data: dbPackage } = await supabase
          .from('career_packages')
          .select('id, base_price, selling_price')
          .eq('id', courseId)
          .maybeSingle();

        if (dbPackage) {
          productFound = true;
          const selling = Number(dbPackage.selling_price ?? dbPackage.base_price ?? 0);
          isFree = selling === 0;
        }
      }
    }

    if (!productFound) {
      return NextResponse.json({ error: 'Product or course not found.' }, { status: 404 });
    }

    if (!isFree) {
      return NextResponse.json(
        {
          error: 'Paid products require completed payment verification. Direct enrollment is prohibited.',
          code: 'PAYMENT_REQUIRED',
        },
        { status: 402 }
      );
    }

    // Direct enrollment is ONLY allowed for verified FREE courses (price = 0)
    const enrollment = await enrollmentService.enrollStudent(user.id, courseId);
    return NextResponse.json({ enrollment });
  } catch (err: any) {
    console.error('Failed to enroll student:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

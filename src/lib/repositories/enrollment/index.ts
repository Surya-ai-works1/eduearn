import { IS_MOCK } from '@/lib/config';
import { IEnrollmentRepository } from './IEnrollmentRepository';
import { MockEnrollmentRepository } from './MockEnrollmentRepository';
import { SupabaseEnrollmentRepository } from './SupabaseEnrollmentRepository';

export const EnrollmentRepository: IEnrollmentRepository = IS_MOCK
  ? new MockEnrollmentRepository()
  : new SupabaseEnrollmentRepository();

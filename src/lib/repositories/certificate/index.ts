// src/lib/repositories/certificate/index.ts

import { IS_MOCK } from "../../config";
import { ICertificateRepository } from "./ICertificateRepository";
import { MockCertificateRepository } from "./MockCertificateRepository";
import { SupabaseCertificateRepository } from "./SupabaseCertificateRepository";

export const CertificateRepository: ICertificateRepository = IS_MOCK
  ? new MockCertificateRepository()
  : new SupabaseCertificateRepository();

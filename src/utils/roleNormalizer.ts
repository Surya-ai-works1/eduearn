/**
 * Role Normalization & Permissions mapper utility.
 * Delegated to rbacResolver for single source of truth consistency.
 */

export { normalizeRole, getPermissionsCountForRole } from "./rbacResolver";
export type { CanonicalRole } from "./rbacResolver";

import rolesJson from "@/data/roles.json";
import type { RoleDefinition, RoleKey } from "./types";

export const ROLES: RoleDefinition[] = rolesJson.roles as RoleDefinition[];

export const ROLE_ORDER: RoleKey[] = ROLES.map((role) => role.key);

export const ROLE_LABELS: Record<RoleKey, string> = Object.fromEntries(
  ROLES.map((role) => [role.key, role.label])
) as Record<RoleKey, string>;

export const ROLE_SHORT_LABELS: Record<RoleKey, string> = Object.fromEntries(
  ROLES.map((role) => [role.key, role.shortLabel])
) as Record<RoleKey, string>;

export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = Object.fromEntries(
  ROLES.map((role) => [role.key, role.description])
) as Record<RoleKey, string>;

export const DEFAULT_ROLE: RoleKey = rolesJson.defaultRole as RoleKey;

export function isRoleKey(value: unknown): value is RoleKey {
  return typeof value === "string" && (ROLE_ORDER as string[]).includes(value);
}

export type RoleKey = "soc_analyst" | "vapt" | "network_security_engineer" | "generalist";

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  shortLabel: string;
  description: string;
}

export type RoleWeights = Record<RoleKey, number>;

import type { RoleKey } from "@/lib/roles";

export interface FindYourPathOption {
  id: string;
  label: string;
  points: Partial<Record<RoleKey, number>>;
}

export interface FindYourPathQuestion {
  id: string;
  prompt: string;
  options: FindYourPathOption[];
}

export interface FindYourPathRecommendation {
  role: RoleKey;
  scores: Record<RoleKey, number>;
  /** True when no track led by a clear margin and the result fell back to Generalist. */
  tooClose: boolean;
}

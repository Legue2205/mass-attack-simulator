export const DAMAGE_TYPES = [
  "Bludgeoning",
  "Piercing",
  "Slashing",
  "Fire",
  "Cold",
  "Lightning",
  "Thunder",
  "Acid",
  "Poison",
  "Psychic",
  "Force",
  "Radiant",
  "Necrotic",
] as const;

export type DamageType = (typeof DAMAGE_TYPES)[number];

export const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Exhaustion",
  "Concentrating",
] as const;

export type Condition = (typeof CONDITIONS)[number];

export const ABILITY_SCORES = [
  "STR",
  "DEX",
  "CON",
  "INT",
  "WIS",
  "CHA",
] as const;

export type AbilityScore = (typeof ABILITY_SCORES)[number];

export interface DamageEntry {
  formula: string;
  type: DamageType;
}

export interface ExtraDamage {
  name: string;
  entries: DamageEntry[];
  enabled: boolean;
}

export interface CreaturePreset {
  id: string;
  name: string;
  atkBonus: number;
  damageEntries: DamageEntry[];
  extraDamage: ExtraDamage;
  maxHp: number;
  ac: number;
  savingThrows: Record<AbilityScore, number>;
}

export interface ArmyGroup {
  preset: CreaturePreset;
  count: number;
  advantage: boolean;
  disadvantage: boolean;
}

export interface MinionInstance {
  id: string;
  presetId: string;
  name: string;
  currentHp: number;
  maxHp: number;
  ac: number;
  selected: boolean;
  conditions: Condition[];
  savingThrows: Record<AbilityScore, number>;
}

export interface HiddenAcPreset {
  id: string;
  label: string;
  ac: number;
}

// Attack simulation
export interface SimulationRequest {
  groups: {
    presetId: string;
    name: string;
    atkBonus: number;
    damageEntries: DamageEntry[];
    extraDamageEntries: DamageEntry[];
    count: number;
    advantage: boolean;
    disadvantage: boolean;
  }[];
  targetAc: number;
}

export interface DamageByType {
  type: DamageType;
  amount: number;
}

export interface GroupResult {
  name: string;
  count: number;
  hits: number;
  crits: number;
  totalDamage: number;
  damageByType: DamageByType[];
  hitAccuracy: number;
  avgDamagePerHit: number;
}

export interface SimulationResult {
  groups: GroupResult[];
  totalHits: number;
  totalCrits: number;
  totalDamage: number;
  totalAttacks: number;
  overallAccuracy: number;
  damageByType: DamageByType[];
}

// Saving throw simulation
export interface SaveRequest {
  minionIds: string[];
  savingThrows: Record<string, number>; // minionId -> save bonus
  dc: number;
  ability: AbilityScore;
  failDamage: string; // formula
  failDamageType: DamageType;
  failConditions: Condition[];
  passDamage: string; // formula (e.g. half damage)
  passDamageType: DamageType;
  passConditions: Condition[];
}

export interface SaveMinionResult {
  minionId: string;
  roll: number;
  total: number;
  passed: boolean;
  damage: number;
  conditions: Condition[];
}

export interface SaveResult {
  results: SaveMinionResult[];
  totalFailed: number;
  totalPassed: number;
  totalDamage: number;
}

// App state for save/load
export interface AppState {
  presets: CreaturePreset[];
  minions: MinionInstance[];
  hiddenAcPresets: HiddenAcPreset[];
}

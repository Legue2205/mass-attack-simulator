import { CreaturePreset, AbilityScore } from "@/types";

const defaultSaves: Record<AbilityScore, number> = {
  STR: 0,
  DEX: 0,
  CON: 0,
  INT: 0,
  WIS: 0,
  CHA: 0,
};

export const DEFAULT_PRESETS: CreaturePreset[] = [
  {
    id: "skeleton",
    name: "Skeleton",
    atkBonus: 4,
    damageEntries: [{ formula: "1d6+2", type: "Slashing" }],
    extraDamage: { name: "", entries: [], enabled: false },
    maxHp: 13,
    ac: 13,
    savingThrows: { ...defaultSaves, DEX: 2 },
  },
  {
    id: "zombie",
    name: "Zombie",
    atkBonus: 3,
    damageEntries: [{ formula: "1d6+1", type: "Bludgeoning" }],
    extraDamage: { name: "", entries: [], enabled: false },
    maxHp: 22,
    ac: 8,
    savingThrows: { ...defaultSaves, CON: 3, WIS: -2 },
  },
  {
    id: "shadow",
    name: "Shadow",
    atkBonus: 4,
    damageEntries: [{ formula: "2d6+2", type: "Necrotic" }],
    extraDamage: { name: "", entries: [], enabled: false },
    maxHp: 16,
    ac: 12,
    savingThrows: { ...defaultSaves, DEX: 2, STR: -3 },
  },
  {
    id: "fire-snake",
    name: "Fire Snake",
    atkBonus: 3,
    damageEntries: [
      { formula: "1d4+3", type: "Piercing" },
      { formula: "1d4", type: "Fire" },
    ],
    extraDamage: {
      name: "Oil Flask",
      entries: [{ formula: "1d4", type: "Fire" }],
      enabled: false,
    },
    maxHp: 22,
    ac: 14,
    savingThrows: { ...defaultSaves, DEX: 3, CON: 2 },
  },
];

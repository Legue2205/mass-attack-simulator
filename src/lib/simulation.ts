import {
  SimulationRequest,
  SimulationResult,
  GroupResult,
  DamageByType,
  DamageType,
  DamageEntry,
} from "@/types";
import { rollFormula } from "./dice";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mergeDamageByType(entries: DamageByType[]): DamageByType[] {
  const map = new Map<DamageType, number>();
  for (const e of entries) {
    map.set(e.type, (map.get(e.type) || 0) + e.amount);
  }
  return Array.from(map.entries()).map(([type, amount]) => ({ type, amount }));
}

function rollDamageEntries(
  entries: DamageEntry[],
  isCrit: boolean
): DamageByType[] {
  return entries.map((entry) => ({
    type: entry.type,
    amount: rollFormula(entry.formula, isCrit),
  }));
}

function simulateGroup(
  group: SimulationRequest["groups"][number],
  targetAc: number
): GroupResult {
  let hits = 0;
  let crits = 0;
  const damageAccum: DamageByType[] = [];

  const totalAttacks = group.count;

  for (let i = 0; i < totalAttacks; i++) {
    let d20: number;
    if (group.advantage) {
      d20 = Math.max(randInt(1, 20), randInt(1, 20));
    } else if (group.disadvantage) {
      d20 = Math.min(randInt(1, 20), randInt(1, 20));
    } else {
      d20 = randInt(1, 20);
    }

    const isCrit = d20 === 20;
    const attackRoll = d20 + group.atkBonus;

    if (isCrit) crits++;

    if (attackRoll >= targetAc || isCrit) {
      hits++;

      // Roll base damage
      const baseDmg = rollDamageEntries(group.damageEntries, isCrit);
      damageAccum.push(...baseDmg);

      // Roll extra damage if present
      if (group.extraDamageEntries.length > 0) {
        const extraDmg = rollDamageEntries(group.extraDamageEntries, isCrit);
        damageAccum.push(...extraDmg);
      }
    }
  }

  const damageByType = mergeDamageByType(damageAccum);
  const totalDamage = damageByType.reduce((s, d) => s + d.amount, 0);

  return {
    name: group.name,
    count: totalAttacks,
    hits,
    crits,
    totalDamage,
    damageByType,
    hitAccuracy: totalAttacks > 0 ? (hits / totalAttacks) * 100 : 0,
    avgDamagePerHit: hits > 0 ? totalDamage / hits : 0,
  };
}

export function runSimulation(request: SimulationRequest): SimulationResult {
  const groups = request.groups.map((g) => simulateGroup(g, request.targetAc));

  const totalHits = groups.reduce((s, g) => s + g.hits, 0);
  const totalCrits = groups.reduce((s, g) => s + g.crits, 0);
  const totalDamage = groups.reduce((s, g) => s + g.totalDamage, 0);
  const totalAttacks = groups.reduce((s, g) => s + g.count, 0);

  const allDamageByType = mergeDamageByType(
    groups.flatMap((g) => g.damageByType)
  );

  return {
    groups,
    totalHits,
    totalCrits,
    totalDamage,
    totalAttacks,
    overallAccuracy: totalAttacks > 0 ? (totalHits / totalAttacks) * 100 : 0,
    damageByType: allDamageByType,
  };
}

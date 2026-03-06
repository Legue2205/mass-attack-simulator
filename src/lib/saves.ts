import {
  SaveRequest,
  SaveResult,
  SaveMinionResult,
  Condition,
} from "@/types";
import { rollFormula } from "./dice";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function runSaveSimulation(request: SaveRequest): SaveResult {
  const results: SaveMinionResult[] = [];

  for (const minionId of request.minionIds) {
    const saveBonus = request.savingThrows[minionId] || 0;
    const roll = randInt(1, 20);
    const total = roll + saveBonus;
    const passed = total >= request.dc;

    let damage = 0;
    let conditions: Condition[] = [];

    if (passed) {
      if (request.passDamage && request.passDamage.trim()) {
        damage = rollFormula(request.passDamage, false);
      }
      conditions = [...request.passConditions];
    } else {
      if (request.failDamage && request.failDamage.trim()) {
        damage = rollFormula(request.failDamage, false);
      }
      conditions = [...request.failConditions];
    }

    results.push({
      minionId,
      roll,
      total,
      passed,
      damage,
      conditions,
    });
  }

  const totalFailed = results.filter((r) => !r.passed).length;
  const totalPassed = results.filter((r) => r.passed).length;
  const totalDamage = results.reduce((s, r) => s + r.damage, 0);

  return { results, totalFailed, totalPassed, totalDamage };
}

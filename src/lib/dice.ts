/**
 * Parse and roll a damage formula like "3d4+2d8+5+1d4".
 * Supports: NdM (dice), plain numbers (flat bonuses), joined by +.
 * Spaces are ignored.
 *
 * On a critical hit, dice are doubled but flat bonuses are not.
 */

interface DiceComponent {
  count: number;
  sides: number;
}

interface ParsedFormula {
  dice: DiceComponent[];
  flat: number;
}

export function parseFormula(formula: string): ParsedFormula {
  const cleaned = formula.replace(/\s/g, "");
  if (!cleaned) return { dice: [], flat: 0 };

  const parts = cleaned.split("+").filter(Boolean);
  const dice: DiceComponent[] = [];
  let flat = 0;

  for (const part of parts) {
    const diceMatch = part.match(/^(\d+)[dD](\d+)$/);
    if (diceMatch) {
      dice.push({
        count: parseInt(diceMatch[1]),
        sides: parseInt(diceMatch[2]),
      });
    } else {
      const num = parseInt(part);
      if (!isNaN(num)) {
        flat += num;
      }
    }
  }

  return { dice, flat };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollFormula(formula: string, isCrit: boolean): number {
  const { dice, flat } = parseFormula(formula);
  let total = flat;

  for (const d of dice) {
    const multiplier = isCrit ? 2 : 1;
    for (let i = 0; i < d.count * multiplier; i++) {
      total += randInt(1, d.sides);
    }
  }

  return total;
}

/** Validate that a formula string is parseable and non-empty */
export function isValidFormula(formula: string): boolean {
  const cleaned = formula.replace(/\s/g, "");
  if (!cleaned) return false;
  const parts = cleaned.split("+").filter(Boolean);
  return parts.every(
    (p) => /^\d+[dD]\d+$/.test(p) || /^\d+$/.test(p)
  );
}

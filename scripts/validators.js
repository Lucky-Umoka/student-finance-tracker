export const PATTERNS = Object.freeze({
     description: /^\S(?:.*\S)?$/,
     amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
     date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
     category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(?<word>\w+)\s+\k<word>\b/i,
});

const ok = (value) => ({ ok: true, value });
const fail = (message) => ({ ok: false, message });

export const collapseSpaces = (text) => text.replace(/\s{2,}/g, " ");

export const isRealDate = (text) => {
  const [year, month, day] = text.split("-").map(Number);   // "2025-02-30" -> [2025, 2, 30]
  const d = new Date(year, month - 1, day);                 // JS months start at 0
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
};

export const validateDescription = (raw) => {
  const text = String(raw ?? "");           // ?? "" turns null/undefined into empty text
  if (!PATTERNS.description.test(text)) {
    return fail("Required. No spaces at the start or end.");
  }
  const dup = text.match(PATTERNS.duplicateWord);
  if (dup) {
    return fail(`Repeated word found: "${dup.groups.word}". Please fix it.`);
  }
  return ok(collapseSpaces(text));
};

export const validateAmount = (raw) => {
  const text = String(raw ?? "");
  if (!PATTERNS.amount.test(text)) {
    return fail("Use a number like 12 or 12.50 (max 2 decimals, no leading zeros).");
  }
  return ok(Number(text));
};

export const validateDate = (raw) => {
  const text = String(raw ?? "");
  if (!PATTERNS.date.test(text)) {
    return fail("Use the format YYYY-MM-DD, for example 2025-09-29.");
  }
  if (!isRealDate(text)) {
    return fail("That date does not exist on the calendar.");
  }
  return ok(text);
};

export const validateCategory = (raw) => {
  const text = String(raw ?? "");
  if (!PATTERNS.category.test(text)) {
    return fail('Letters, spaces and hyphens only, for example "Fast-food".');
  }
  return ok(text);
};

export function validateRecord(input) {
  const checks = {
    description: validateDescription(input.description),
    amount: validateAmount(input.amount),
    category: validateCategory(input.category),
    date: validateDate(input.date),
  };

  const errors = {};
  const value = {};
  for (const [field, result] of Object.entries(checks)) {
    if (result.ok) value[field] = result.value;
    else errors[field] = result.message;
  }
  return { ok: Object.keys(errors).length === 0, errors, value };
}


export const validateCap = (raw) => {
  const text = String(raw ?? "");
  if (!PATTERNS.amount.test(text)) return fail("Use a number like 500 or 500.50. Use 0 for no cap.");
  return ok(Number(text));
};
/** Chiffres uniquement, max 10 (numéro national FR). */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/** Affichage : XX XX XX XX XX */
export function formatPhoneFr(value: string): string {
  const digits = phoneDigits(value);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 2) {
    parts.push(digits.slice(i, i + 2));
  }
  return parts.join(" ");
}

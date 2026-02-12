// VIMMO Premium — Data sanitization
// PRD 3.A: Nettoyage systematique des donnees

/**
 * PRD: Ville < 2 chars → "Localisation Privilegiee"
 * Web UI uses title case (not uppercase like Remotion video).
 */
export function formatVille(ville: string | null | undefined): string {
  if (!ville || ville.trim().length < 2) return 'Localisation Privilegiee';
  return ville.trim();
}

export function formatQuartier(quartier: string | null | undefined): string {
  if (!quartier || quartier.trim().length < 2) return '';
  return quartier.trim();
}

/**
 * PRD: Prix < 1000 → "Prix sur demande"
 * Adds euro + thousand separators.
 */
export function formatPrix(prix: string | null | undefined): string {
  if (!prix) return 'Prix sur demande';

  const cleaned = prix.trim();
  if (cleaned.toLowerCase().includes('sur demande')) return 'Prix sur demande';

  const numeric = cleaned.replace(/[^\d]/g, '');
  if (!numeric) return 'Prix sur demande';

  const value = Number(numeric);
  if (value < 1000) return 'Prix sur demande';

  const formatted = value.toLocaleString('fr-FR');
  return `${formatted} \u20AC`;
}

export function formatLocation(ville: string | null | undefined, quartier: string | null | undefined): string {
  const v = formatVille(ville);
  const q = formatQuartier(quartier);
  if (q && v !== 'Localisation Privilegiee') return `${v} — ${q}`;
  return v;
}

/**
 * Unit conversions and Indian Currency Formatters
 * Standardized for Karnataka / Mandya Real Estate
 */

export const SQFT_PER_GUNTA = 1089;
export const GUNTAS_PER_ACRE = 40;
export const SQFT_PER_ACRE = SQFT_PER_GUNTA * GUNTAS_PER_ACRE; // 43,560 sqft
export const SQM_PER_SQFT = 0.092903;
export const SQFT_PER_SQM = 10.7639;

export type AreaUnit = 'sqft' | 'gunta' | 'acre' | 'sqm';

/**
 * Converts area accurately between units
 */
export function convertArea(value: number, fromUnit: AreaUnit, toUnit: AreaUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  if (fromUnit === toUnit) return value;

  // Convert to canonical base: square feet (sqft)
  let sqft: number;
  switch (fromUnit) {
    case 'sqft':
      sqft = value;
      break;
    case 'gunta':
      sqft = value * SQFT_PER_GUNTA;
      break;
    case 'acre':
      sqft = value * SQFT_PER_ACRE;
      break;
    case 'sqm':
      sqft = value * SQFT_PER_SQM;
      break;
  }

  // Convert from sqft to target unit
  switch (toUnit) {
    case 'sqft':
      return Math.round(sqft * 100) / 100;
    case 'gunta':
      return Math.round((sqft / SQFT_PER_GUNTA) * 1000) / 1000;
    case 'acre':
      return Math.round((sqft / SQFT_PER_ACRE) * 1000) / 1000;
    case 'sqm':
      return Math.round((sqft * SQM_PER_SQFT) * 100) / 100;
  }
}

/**
 * Calculates plot area in sqft from dimensions (e.g. 30x40 -> 1200 sqft)
 */
export function calculatePlotDimensionsArea(dimensions: string): number | null {
  const match = dimensions.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const width = parseFloat(match[1]);
  const length = parseFloat(match[2]);
  return Math.round(width * length);
}

/**
 * Formats Indian Currency (INR) into human-readable Lakhs and Crores
 * Example: 4500000 -> "₹45 Lakh", 18500000 -> "₹1.85 Cr"
 */
export function formatPriceINR(amount: number, locale: 'en' | 'kn' = 'en'): string {
  if (!amount || isNaN(amount)) return locale === 'kn' ? '₹೦' : '₹0';

  const prefix = '₹';

  if (amount >= 10000000) {
    const cr = amount / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '');
    return locale === 'kn' ? `${prefix}${formatted} ಕೋಟಿ` : `${prefix}${formatted} Cr`;
  }

  if (amount >= 100000) {
    const lakh = amount / 100000;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, '');
    return locale === 'kn' ? `${prefix}${formatted} ಲಕ್ಷ` : `${prefix}${formatted} Lakh`;
  }

  if (amount >= 1000) {
    const k = amount / 1000;
    const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.?0+$/, '');
    return locale === 'kn' ? `${prefix}${formatted} ಸಾವಿರ` : `${prefix}${formatted} K`;
  }

  return `${prefix}${amount.toLocaleString('en-IN')}`;
}

/**
 * Formats area representation in English or Kannada
 */
export function formatAreaDisplay(areaSqft: number, category: string, locale: 'en' | 'kn' = 'en'): string {
  if (category === 'AGRICULTURAL') {
    const acres = areaSqft / SQFT_PER_ACRE;
    if (acres >= 1) {
      const wholeAcres = Math.floor(acres);
      const remainingGuntas = Math.round((areaSqft % SQFT_PER_ACRE) / SQFT_PER_GUNTA);
      if (remainingGuntas > 0) {
        return locale === 'kn'
          ? `${wholeAcres} ಎಕರೆ ${remainingGuntas} ಗುಂಟೆ`
          : `${wholeAcres} Acre ${remainingGuntas} Gunta`;
      }
      return locale === 'kn' ? `${wholeAcres} ಎಕರೆ` : `${wholeAcres} Acre${wholeAcres > 1 ? 's' : ''}`;
    }
    const guntas = Math.round((areaSqft / SQFT_PER_GUNTA) * 10) / 10;
    return locale === 'kn' ? `${guntas} ಗುಂಟೆ` : `${guntas} Gunta`;
  }

  // Plots / Sites
  if (category === 'PLOT') {
    const guntas = Math.round((areaSqft / SQFT_PER_GUNTA) * 100) / 100;
    return locale === 'kn'
      ? `${areaSqft.toLocaleString('en-IN')} ಚ.ಅಡಿ (${guntas} ಗುಂಟೆ)`
      : `${areaSqft.toLocaleString('en-IN')} sq.ft (${guntas} Gunta)`;
  }

  // Residential / Commercial
  return locale === 'kn'
    ? `${areaSqft.toLocaleString('en-IN')} ಚ.ಅಡಿ`
    : `${areaSqft.toLocaleString('en-IN')} sq.ft`;
}

import { describe, it, expect } from 'vitest';
import {
  convertArea,
  calculatePlotDimensionsArea,
  formatPriceINR,
  formatAreaDisplay,
  SQFT_PER_GUNTA,
  SQFT_PER_ACRE,
} from '../src/units';
import { getTranslation } from '../src/i18n';

describe('Karnataka / Mandya Land Area Conversion Utilities', () => {
  it('correctly validates 1 Gunta equals 1,089 sqft', () => {
    expect(convertArea(1, 'gunta', 'sqft')).toBe(1089);
    expect(convertArea(1089, 'sqft', 'gunta')).toBe(1);
  });

  it('correctly validates 1 Acre equals 40 Guntas (43,560 sqft)', () => {
    expect(convertArea(1, 'acre', 'gunta')).toBe(40);
    expect(convertArea(1, 'acre', 'sqft')).toBe(43560);
    expect(convertArea(43560, 'sqft', 'acre')).toBe(1);
  });

  it('correctly converts standard Karnataka site dimensions', () => {
    // 30x40 site
    const area30x40 = calculatePlotDimensionsArea('30x40');
    expect(area30x40).toBe(1200);
    const guntas30x40 = convertArea(1200, 'sqft', 'gunta');
    expect(guntas30x40).toBeCloseTo(1.102, 2);

    // 40x60 site
    const area40x60 = calculatePlotDimensionsArea('40x60');
    expect(area40x60).toBe(2400);

    // 50x80 site
    const area50x80 = calculatePlotDimensionsArea('50 * 80');
    expect(area50x80).toBe(4000);
  });

  it('correctly formats Indian currency (Lakhs and Crores)', () => {
    expect(formatPriceINR(4500000, 'en')).toBe('₹45 Lakh');
    expect(formatPriceINR(18500000, 'en')).toBe('₹1.85 Cr');
    expect(formatPriceINR(25000, 'en')).toBe('₹25 K');

    // Kannada format
    expect(formatPriceINR(4500000, 'kn')).toBe('₹45 ಲಕ್ಷ');
    expect(formatPriceINR(20000000, 'kn')).toBe('₹2 ಕೋಟಿ');
  });

  it('correctly formats display areas for agricultural and residential properties', () => {
    // Agricultural: 2 acres 10 guntas
    const agAreaSqft = 2 * SQFT_PER_ACRE + 10 * SQFT_PER_GUNTA;
    expect(formatAreaDisplay(agAreaSqft, 'AGRICULTURAL', 'en')).toBe('2 Acre 10 Gunta');
    expect(formatAreaDisplay(agAreaSqft, 'AGRICULTURAL', 'kn')).toBe('2 ಎಕರೆ 10 ಗುಂಟೆ');

    // Residential site: 1200 sqft
    expect(formatAreaDisplay(1200, 'RESIDENTIAL', 'en')).toBe('1,200 sq.ft');
    expect(formatAreaDisplay(1200, 'RESIDENTIAL', 'kn')).toBe('1,200 ಚ.ಅಡಿ');
  });

  it('returns valid bilingual translations', () => {
    expect(getTranslation('app_name', 'en')).toBe('Mandya Properties');
    expect(getTranslation('app_name', 'kn')).toBe('ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್');
    expect(getTranslation('badge_owner', 'kn')).toBe('ನೇರ ಮಾಲೀಕರು');
  });
});

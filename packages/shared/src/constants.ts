import { MandyaTaluk } from './types';

export interface TalukMetadata {
  id: MandyaTaluk;
  nameEn: string;
  nameKn: string;
  centerLat: number;
  centerLng: number;
  popularLocalities: Array<{
    en: string;
    kn: string;
    pin: string;
  }>;
}

export const MANDYA_TALUKS: Record<MandyaTaluk, TalukMetadata> = {
  MANDYA: {
    id: 'MANDYA',
    nameEn: 'Mandya (City & Rural)',
    nameKn: 'ಮಂಡ್ಯ (ನಗರ ಮತ್ತು ಗ್ರಾಮಾಂತರ)',
    centerLat: 12.5244,
    centerLng: 76.8958,
    popularLocalities: [
      { en: 'VV Nagar', kn: 'ವಿ.ವಿ. ನಗರ', pin: '571401' },
      { en: 'Subhash Nagar', kn: 'ಸುಭಾಷ್ ನಗರ', pin: '571401' },
      { en: 'Ashok Nagar', kn: 'ಅಶೋಕ್ ನಗರ', pin: '571401' },
      { en: 'Guthalu Colony', kn: 'ಗುತ್ತಲು ಕಾಲೋನಿ', pin: '571403' },
      { en: 'Kallahalli', kn: 'ಕಲ್ಲಹಳ್ಳಿ', pin: '571401' },
      { en: 'Sugar Town', kn: 'ಶುಗರ್ ಟೌನ್', pin: '571402' },
      { en: 'Mandya Highway Service Rd', kn: 'ಮಂಡ್ಯ ಹೆದ್ದಾರಿ ಸರ್ವಿಸ್ ರಸ್ತೆ', pin: '571401' },
    ],
  },
  MADDUR: {
    id: 'MADDUR',
    nameEn: 'Maddur',
    nameKn: 'ಮದ್ದೂರು',
    centerLat: 12.5844,
    centerLng: 77.0450,
    popularLocalities: [
      { en: 'Maddur Town', kn: 'ಮದ್ದೂರು ಟೌನ್', pin: '571428' },
      { en: 'Shivapura', kn: 'ಶಿವಪುರ', pin: '571428' },
      { en: 'Kestur Road', kn: 'ಕೆಸ್ತೂರು ರಸ್ತೆ', pin: '571428' },
      { en: 'Besagarahalli', kn: 'ಬೆಸಗರಹಳ್ಳಿ', pin: '571419' },
    ],
  },
  SRIRANGAPATNA: {
    id: 'SRIRANGAPATNA',
    nameEn: 'Srirangapatna',
    nameKn: 'ಶ್ರೀರಂಗಪಟ್ಟಣ',
    centerLat: 12.4184,
    centerLng: 76.6947,
    popularLocalities: [
      { en: 'Fort Area', kn: 'ಕೋಟೆ ಪ್ರದೇಶ', pin: '571438' },
      { en: 'Ganjam', kn: 'ಗಂಜಾಂ', pin: '571477' },
      { en: 'Paschimavahini', kn: 'ಪಶ್ಚಿಮವಾಹಿನಿ', pin: '571438' },
      { en: 'Arakere', kn: 'ಅರಕೆರೆ', pin: '571415' },
    ],
  },
  PANDAVAPURA: {
    id: 'PANDAVAPURA',
    nameEn: 'Pandavapura',
    nameKn: 'ಪಾಂಡವಪುರ',
    centerLat: 12.4975,
    centerLng: 76.6711,
    popularLocalities: [
      { en: 'Pandavapura Town', kn: 'ಪಾಂಡವಪುರ ಟೌನ್', pin: '571434' },
      { en: 'Melukote Heritage Zone', kn: 'ಮೇಲುಕೋಟೆ', pin: '571431' },
      { en: 'Harohalli', kn: 'ಹಾರೋಹಳ್ಳಿ', pin: '571434' },
    ],
  },
  MALAVALLI: {
    id: 'MALAVALLI',
    nameEn: 'Malavalli',
    nameKn: 'ಮಳವಳ್ಳಿ',
    centerLat: 12.3860,
    centerLng: 77.0583,
    popularLocalities: [
      { en: 'Malavalli Town', kn: 'ಮಳವಳ್ಳಿ ಟೌನ್', pin: '571430' },
      { en: 'Kollegala Road', kn: 'ಕೊಳ್ಳೇಗಾಲ ರಸ್ತೆ', pin: '571430' },
      { en: 'Halagur', kn: 'ಹಲಗೂರು', pin: '571421' },
      { en: 'Belakavadi', kn: 'ಬೆಳಕವಾಡಿ', pin: '571417' },
    ],
  },
  NAGAMANGALA: {
    id: 'NAGAMANGALA',
    nameEn: 'Nagamangala',
    nameKn: 'ನಾಗಮಂಗಲ',
    centerLat: 12.8183,
    centerLng: 76.7583,
    popularLocalities: [
      { en: 'Nagamangala Town', kn: 'ನಾಗಮಂಗಲ ಟೌನ್', pin: '571432' },
      { en: 'Bellur Cross', kn: 'ಬೆಳ್ಳೂರು ಕ್ರಾಸ್', pin: '571418' },
      { en: 'Bindiganavile', kn: 'ಬಿಂದಿಗನವಿಲೆ', pin: '571802' },
    ],
  },
  KRISHNARAJAPETE: {
    id: 'KRISHNARAJAPETE',
    nameEn: 'Krishnarajapete (K.R. Pete)',
    nameKn: 'ಕೃಷ್ಣರಾಜಪೇಟೆ (ಕೆ.ಆರ್. ಪೇಟೆ)',
    centerLat: 12.6644,
    centerLng: 76.4914,
    popularLocalities: [
      { en: 'K.R. Pete Town', kn: 'ಕೆ.ಆರ್. ಪೇಟೆ ಟೌನ್', pin: '571426' },
      { en: 'Santhebachahalli', kn: 'ಸಂತೆಬಾಚಹಳ್ಳಿ', pin: '571436' },
      { en: 'Sheelanere', kn: 'ಶೀಲನೆರೆ', pin: '571426' },
    ],
  },
};

export const COMMON_AMENITIES = [
  { id: 'cauvery_water', en: 'Cauvery / Borewell Water', kn: 'ಕಾವೇರಿ / ಬೋರ್‌ವೆಲ್ ನೀರು' },
  { id: 'tar_road', en: 'Tar Road Access (30ft+)', kn: 'ಡಾಂಬರ್ ರಸ್ತೆ ಸಂಪರ್ಕ' },
  { id: 'electricity', en: '3-Phase Electricity / BESCOM', kn: 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ (ಬೆಸ್ಕಾಂ)' },
  { id: 'gated_compound', en: 'Compound Wall / Gated', kn: 'ಕಾಂಪೌಂಡ್ ಗೋಡೆ / ಗೇಟ್' },
  { id: 'underground_drainage', en: 'Underground Drainage (UGD)', kn: 'ಒಳಚರಂಡಿ ವ್ಯವಸ್ಥೆ (ಯು.ಜಿ.ಡಿ)' },
  { id: 'street_lights', en: 'Street Lights', kn: 'ಬೀದಿ ದೀಪಗಳು' },
  { id: 'clear_title', en: 'Clear Legal Documents', kn: 'ಸ್ಪಷ್ಟ ದಾಖಲೆಗಳು' },
  { id: 'canal_irrigation', en: 'KRS Canal Irrigation', kn: 'ಕೆ.ಆರ್.ಎಸ್ ಕಾಲುವೆ ನೀರಾವರಿ' },
  { id: 'near_expressway', en: 'Near Mys-Blr Expressway', kn: 'ಮೈಸೂರು-ಬೆಂಗಳೂರು ಹೆದ್ದಾರಿ ಹತ್ತಿರ' },
  { id: 'car_parking', en: 'Covered Car Parking', kn: 'ಕಾರ್ ಪಾರ್ಕಿಂಗ್' },
];

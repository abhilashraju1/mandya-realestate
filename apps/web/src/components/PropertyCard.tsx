'use client';
import React from 'react';
import Link from 'next/link';
import { PropertyListing, formatPriceINR, formatAreaDisplay } from '@mandya-realestate/shared';
import { useLanguage } from '../context/LanguageContext';
import { Heart, MapPin, CheckCircle, Shield, Droplets } from 'lucide-react';

interface PropertyCardProps {
  property: PropertyListing;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved = false,
  onToggleSave,
}) => {
  const { locale, t } = useLanguage();
  const coverImage = property.media[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

  const sellerBadgeLabel =
    property.sellerType === 'OWNER'
      ? t('badge_owner')
      : property.sellerType === 'AGENT'
      ? t('badge_agent')
      : t('badge_builder');

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col group">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={coverImage}
          alt={locale === 'kn' ? property.titleKn : property.titleEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="bg-navy-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {t('badge_demo')}
          </span>
          <span className="bg-teal-700/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {sellerBadgeLabel}
          </span>
          {property.isVerified && (
            <span className="bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" />
              {t('badge_verified')}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            aria-label="Save Property"
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-red-500 shadow-md transition-transform active:scale-90 z-10"
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-gray-100">
          <div className="text-base font-extrabold text-navy-900">
            {formatPriceINR(property.priceInr, locale)}
            {property.transactionType === 'RENT' && (
              <span className="text-xs font-normal text-gray-500">/mo</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-teal-800 font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>
              {locale === 'kn' ? property.location.localityKn : property.location.localityEn},{' '}
              {property.location.taluk}
            </span>
          </div>

          {/* Title */}
          <Link href={`/property/${property.id}`}>
            <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-2 hover:text-teal-700 transition-colors">
              {locale === 'kn' ? property.titleKn : property.titleEn}
            </h3>
          </Link>

          {/* Key Property Specs */}
          <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-gray-600">
            {property.plotDimensions && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-800">
                {property.plotDimensions} ft
              </span>
            )}
            <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-800">
              {formatAreaDisplay(property.areaSqft, property.category, locale)}
            </span>
            {property.bedrooms && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-800">
                {property.bedrooms} BHK
              </span>
            )}
            {property.facing && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-800">
                {property.facing} Facing
              </span>
            )}
            {property.waterSource && property.waterSource.length > 0 && (
              <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                <Droplets className="w-3 h-3 text-teal-600" />
                {property.waterSource[0] === 'CANAL_IRRIGATION' ? 'KRS Canal' : 'Borewell'}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer with CTA */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            {property.propertyCode}
          </span>
          <Link
            href={`/property/${property.id}`}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            {t('view_details')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

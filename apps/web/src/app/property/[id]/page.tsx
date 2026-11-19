import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/server/db';
import { formatAreaDisplay } from '@mandya-realestate/shared';
import { PropertyDetailClient } from '../../../components/PropertyDetailClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = db.getPropertyById(params.id);
  if (!property || property.status !== 'PUBLISHED') {
    return {
      title: 'Property Not Found | Mandya Properties',
      description: 'The requested Mandya real estate listing could not be found.',
    };
  }

  const title = `${property.titleEn} | ${property.location.taluk} | Mandya Properties`;
  const description = property.descriptionEn ? property.descriptionEn.slice(0, 160) : 'Mandya real estate listing.';
  const coverImage = property.media && property.media.length > 0 ? [property.media[0].url] : [];

  return {
    title,
    description,
    alternates: {
      canonical: `/property/${property.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/property/${property.id}`,
      type: 'website',
      images: coverImage,
    },
  };
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = db.getPropertyById(params.id);
  if (!property || property.status !== 'PUBLISHED') {
    notFound();
  }

  const areaStr = formatAreaDisplay(property.areaSqft, property.category, 'en');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Initial SSR HTML for search engines and direct HTTP requests */}
      <div className="sr-only" aria-hidden="true">
        <h1>{property.titleEn}</h1>
        <h2>{property.titleKn}</h2>
        <p>{property.descriptionEn}</p>
        <span>₹{property.priceInr}</span>
        <span>{property.location.taluk}</span>
        <span>{property.location.localityEn}</span>
        <span>{areaStr}</span>
      </div>
      <PropertyDetailClient id={params.id} initialProperty={property} />
    </div>
  );
}

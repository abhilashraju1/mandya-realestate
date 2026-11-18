import React from 'react';
import { PropertyDetailClient } from '../../../components/PropertyDetailClient';

export function generateStaticParams() {
  return [
    { id: 'prop-1' },
    { id: 'prop-2' },
    { id: 'prop-3' },
    { id: 'prop-4' },
  ];
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return <PropertyDetailClient id={params.id} />;
}

'use client';
import { useState, useEffect } from 'react';
import { PropertyListing, SeekerEnquiry, SiteVisitRequest } from '@mandya-realestate/shared';
import { INITIAL_PROPERTIES } from './mock-data';

export const usePropertyStore = () => {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [enquiries, setEnquiries] = useState<SeekerEnquiry[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRequest[]>([]);

  useEffect(() => {
    // Load from localStorage or initialize
    const savedProps = localStorage.getItem('mandya_properties_list');
    if (savedProps) {
      try {
        setProperties(JSON.parse(savedProps));
      } catch (e) {
        setProperties(INITIAL_PROPERTIES);
      }
    } else {
      setProperties(INITIAL_PROPERTIES);
      localStorage.setItem('mandya_properties_list', JSON.stringify(INITIAL_PROPERTIES));
    }

    const savedFavs = localStorage.getItem('mandya_saved_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('mandya_saved_favorites', JSON.stringify(updated));
  };

  const addProperty = (newProp: PropertyListing) => {
    const updated = [newProp, ...properties];
    setProperties(updated);
    localStorage.setItem('mandya_properties_list', JSON.stringify(updated));
  };

  const updatePropertyStatus = (id: string, status: PropertyListing['status']) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, status } : p));
    setProperties(updated);
    localStorage.setItem('mandya_properties_list', JSON.stringify(updated));
  };

  const addEnquiry = (enq: SeekerEnquiry) => {
    setEnquiries((prev) => [enq, ...prev]);
  };

  const addSiteVisit = (visit: SiteVisitRequest) => {
    setSiteVisits((prev) => [visit, ...prev]);
  };

  return {
    properties,
    favorites,
    enquiries,
    siteVisits,
    toggleFavorite,
    addProperty,
    updatePropertyStatus,
    addEnquiry,
    addSiteVisit,
  };
};

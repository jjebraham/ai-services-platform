import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { llmServices } from './llmData';
import { useLanguage } from './LanguageContext';

export default function LLMDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const service = llmServices.find(s => s.id === id);
  if (!service) {
    return (
      <div className="container">
        <h2>{t('services')}</h2>
        <p>Service not found</p>
        <Link to="/">{t('home')}</Link>
      </div>
    );
  }
  return (
    <div className="container">
      <h1>{service.name}</h1>
      <p>{service.details}</p>
      <Link to="/">{t('home')}</Link>
    </div>
  );
}

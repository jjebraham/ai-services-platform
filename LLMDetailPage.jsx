import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { llmServices } from './llmData';
import { useLanguage } from './LanguageContext';

export default function LLMDetailPage() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const service = llmServices.find(s => s.id === id);
  if (!service) {
    return (
      <div className="container">
        <h2>{t('services')}</h2>
        <p>{t('serviceNotFound')}</p>
        <Link to="/">{t('home')}</Link>
      </div>
    );
  }
  return (
    <div className="container">
      <h1>{service.name[lang]}</h1>
      <p>{service.details[lang]}</p>
      <Link to="/">{t('home')}</Link>
    </div>
  );
}

import React from 'react';
import { useLanguage } from './LanguageContext';

export default function PaymentsPage() {
  const { t } = useLanguage();
  return (
    <div className="container">
      <h1>{t('payments')}</h1>
      <p>Select manual or crypto payment options during checkout.</p>
    </div>
  );
}

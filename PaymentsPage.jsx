import React from 'react';
import { useLanguage } from './LanguageContext';

export default function PaymentsPage() {
  const { t, lang } = useLanguage();

  const paymentServices = [
    { name: { en: 'Spotify', fa: 'اسپاتیفای' }, logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
    { name: { en: 'YouTube', fa: 'یوتیوب' }, logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg' },
    { name: { en: 'SoundCloud', fa: 'ساندکلود' }, logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/SoundCloud_logo_without_cloud.svg' }
  ];

  return (
    <div className="container">
      <h1>{t('payments')}</h1>
      <p>{t('paymentsIntro')}</p>
      <div className="payment-services">
        {paymentServices.map((service) => (
          <div key={service.name.en} className="payment-service">
            <img src={service.logo} alt={service.name.en} width="40" />
            <span>{service.name[lang]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

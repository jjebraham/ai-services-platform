import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

function BasketPage() {
  const { t } = useLanguage();
  const [basketItems, setBasketItems] = useState([
    { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 20.00 }
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate totals
    const itemSubtotal = basketItems.reduce((sum, item) => sum + item.price, 0);
    const taxAmount = itemSubtotal * 0.05; // 5% tax
    const vatAmount = itemSubtotal * 0.09; // 9% VAT
    
    setSubtotal(itemSubtotal);
    setTax(taxAmount);
    setVat(vatAmount);
    setTotal(itemSubtotal + taxAmount + vatAmount);
  }, [basketItems]);

  const removeFromBasket = (itemId) => {
    setBasketItems(basketItems.filter(item => item.id !== itemId));
  };

  const clearBasket = () => {
    setBasketItems([]);
  };

  return (
    <div className="basket-page">
      <div className="container">
        <h1 className="page-title">{t('basket')}</h1>
        
        {basketItems.length === 0 ? (
          <div className="empty-basket">
            <p>{t('emptyBasket')}</p>
            <Link to="/services" className="btn btn-primary">
              {t('browseServices')}
            </Link>
          </div>
        ) : (
          <div className="basket-content">
            <div className="basket-items">
              {basketItems.map(item => (
                <div key={item.id} className="basket-item">
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <button 
                    className="remove-item" 
                    onClick={() => removeFromBasket(item.id)}
                    aria-label={`Remove ${item.name} from basket`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="clear-basket" onClick={clearBasket}>
                {t('clearBasket')}
              </button>
            </div>
            
            <div className="basket-summary">
              <h2>{t('orderSummary')}</h2>
              <div className="summary-row">
                <span>{t('subtotal')}:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>{t('tax')}:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>{t('vat')}:</span>
                <span>${vat.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>{t('total')}:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <button className="btn btn-primary checkout-btn">
                {t('checkout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BasketPage;
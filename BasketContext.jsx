import React, { createContext, useContext, useState } from 'react';

const BasketContext = createContext();

export function BasketProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToBasket = (item) => setItems((prev) => [...prev, item]);
  const removeFromBasket = (id) =>
    setItems((prev) => prev.filter((item) => item._id !== id));
  const clearBasket = () => setItems([]);

  return (
    <BasketContext.Provider
      value={{ items, addToBasket, removeFromBasket, clearBasket }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export const useBasket = () => useContext(BasketContext);

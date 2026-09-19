import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('vyava_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vyava_cart', JSON.stringify(items));
  }, [items]);

  const FREE_DELIVERY_THRESHOLD = 500.0;
  const DEFAULT_DELIVERY_FEE = 40.0;

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          product_name: product.product_name,
          unit: product.unit || 'kg',
          asking_price: product.asking_price,
          discount_price: product.discount_price,
          image_url: product.image_url,
          farmer_name: product.farmer_name,
          quality_grade: product.quality_grade,
          ai_freshness_score: product.ai_freshness_score,
          quantity: quantity,
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const price = item.discount_price || item.asking_price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || items.length === 0 ? 0.0 : DEFAULT_DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeededForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee,
        totalAmount: Math.round(totalAmount * 100) / 100,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        isFreeDelivery,
        amountNeededForFree: Math.round(amountNeededForFree * 100) / 100,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

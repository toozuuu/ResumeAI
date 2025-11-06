import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Only load Stripe if API key is provided
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const StripeContext = createContext();

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  return (
    <StripeContext.Provider value={{ stripePromise, isStripeConfigured: !!stripeKey }}>
      {children}
    </StripeContext.Provider>
  );
};


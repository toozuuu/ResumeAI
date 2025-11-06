import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Perfect for trying out the service',
      features: [
        '3 resume analyses per month',
        'Basic match score',
        'Keyword suggestions',
        'Improvement recommendations',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'month',
      description: 'Best for active job seekers',
      features: [
        'Unlimited resume analyses',
        'AI-generated cover letters',
        'Resume section rewriting',
        'Premium templates',
        'Priority support',
      ],
      cta: 'Subscribe Now',
      popular: true,
      stripePriceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID,
    },
    {
      name: 'Career+',
      price: '$19',
      period: 'month',
      description: 'Complete career toolkit',
      features: [
        'Everything in Pro',
        'AI interview prep',
        'Resume export (PDF/DOCX)',
        'Multiple resume versions',
        'Advanced analytics',
        '1-on-1 career coaching',
      ],
      cta: 'Subscribe Now',
      popular: false,
      stripePriceId: process.env.REACT_APP_STRIPE_CAREER_PLUS_PRICE_ID,
    },
  ];

  const handleSubscribe = async (plan) => {
    if (!currentUser) {
      navigate('/dashboard');
      return;
    }

    if (plan.name === 'Free') {
      navigate('/dashboard');
      return;
    }

    // Handle Stripe checkout
    // This would typically redirect to a Stripe checkout page
    toast.info('Stripe integration coming soon! Please contact support to upgrade.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 14-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;


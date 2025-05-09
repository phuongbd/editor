import React, { useState } from 'react';
import { Check } from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';

interface PlanFeature {
  text: string;
  subItems?: string[];
  underline?: boolean;
}

interface PricingPlan {
  name: string;
  subtitle: string;
  price: number;
  badge?: {
    text: string;
    type: 'recommended' | 'scalable';
  };
  features: PlanFeature[];
}

const PricingPlans = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const handleBillingToggle = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
  };

  // Calculate yearly prices (20% discount)
  const getPrice = (monthlyPrice: number): string => {
    return billingCycle === 'monthly' 
      ? monthlyPrice.toString() 
      : (monthlyPrice * 0.8).toFixed(1);
  };

  const plans: PricingPlan[] = [
    {
      name: 'Growth',
      subtitle: 'For growing business',
      price: 23.9,
      badge: {
        text: 'Recommended',
        type: 'recommended'
      },
      features: [
        { text: '147 total languages' },
        { text: '168 total currencies' },
        { 
          text: 'Quality control:',
          subItems: [
            'Translation edit for {5} languages',
            '{100} glossary rules'
          ]
        },
        { text: '{6} AI translation engines supported' },
        { text: 'Translation automation for {10} pages', underline: true },
        { text: 'Image localization for {10} pages' },
        { text: 'Management for SEO elements' },
        { text: 'Global sales insights' }
      ]
    },
    {
      name: 'Premium',
      subtitle: 'For growing business',
      price: 47.9,
      badge: {
        text: 'Scalable',
        type: 'scalable'
      },
      features: [
        { text: '147 total languages' },
        { text: '168 total currencies' },
        { 
          text: 'Quality control:',
          subItems: [
            'Translation edit for {20} languages',
            '{500} glossary rules'
          ]
        },
        { text: '{6} AI translation engines supported' },
        { text: 'Translation automation for {100} pages', underline: true },
        { text: 'Image localization for {100} pages' },
        { text: 'Management for SEO elements' },
        { text: 'Global sales insights' }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <style>
        {`
          .ribbon-recommended {
            position: relative;
            background-color: #581C87;
            color: white;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 20px;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 25% 100%, 0 100%);
          }
        `}
      </style>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Tailored plans for you</h1>
      
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-end mb-10 bg-gray-100 rounded-full p-1 w-fit ml-auto">
        <button
          onClick={() => handleBillingToggle('monthly')}
          className={`px-6 py-3 rounded-full transition-colors ${
            billingCycle === 'monthly' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
          aria-label="Pay monthly"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleBillingToggle('monthly')}
        >
          Pay monthly
        </button>
        <button
          onClick={() => handleBillingToggle('yearly')}
          className={`px-6 py-3 rounded-full flex items-center gap-2 transition-colors ${
            billingCycle === 'yearly' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
          aria-label="Pay yearly"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleBillingToggle('yearly')}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Pay yearly (SAVE 20%)
        </button>
      </div>
      
      {/* Pricing Cards Container */}
      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan, index) => (
          <div 
            key={index}
            className={`relative rounded-3xl border-2 ${
              plan.name === 'Growth' ? 'border-red-500' : 'border-gray-200'
            } overflow-hidden`}
          >
            {/* Badge */}
            {plan.badge && (
              plan.badge.type === 'recommended' ? (
                <div className="absolute top-0 right-0">
                  <div className="ribbon-recommended">
                    Recommended
                  </div>
                </div>
              ) : (
                <div className="absolute right-8 top-5 text-red-500 text-sm font-medium">
                  {plan.badge.text}
                </div>
              )
            )}
            
            <div className="p-8 pt-16">
              <h2 
                className={`text-5xl font-bold ${
                  plan.name === 'Growth' ? 'text-red-500' : 'text-gray-800'
                } mb-1`}
              >
                {plan.name}
              </h2>
              <p className="text-gray-600 mb-6">{plan.subtitle}</p>
              
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-end">
                  <span className="text-5xl font-bold mr-2">${getPrice(plan.price)}</span>
                  <span className="text-gray-500">per month</span>
                </div>
              </div>
              
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="text-red-500 w-6 h-6 mr-2 mt-0.5 flex-shrink-0" />
                    {feature.subItems ? (
                      <div>
                        <span className="text-gray-700">{feature.text}</span>
                        <ul className="pl-8 mt-2 space-y-2">
                          {feature.subItems.map((subItem, subIndex) => (
                            <li key={subIndex} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                              <span className="text-gray-700">{subItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="text-gray-700">
                        {feature.underline ? (
                          <>
                            {feature.text.split('{')[0]}
                            <span className="underline">
                              {feature.text.match(/\{(\d+)\}/)?.[1] || ''}
                            </span>
                            {feature.text.split('}')[1] || ''}
                          </>
                        ) : (
                          feature.text
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Circle accent at bottom right of card */}
              {plan.name === 'Growth' && (
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gray-800 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;
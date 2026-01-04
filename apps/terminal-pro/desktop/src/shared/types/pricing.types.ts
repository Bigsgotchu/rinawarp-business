/**
 * Pricing system as source of truth
 * Defines all available plans and their pricing (matches rinawarptech.com)
 */

export const PRICING_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        billing: 'free' as const,
        features: ['basic-terminal', 'basic-ai-assistance'],
        description: 'Free plan with basic features',
        soldOut: false
    },
    STARTER: {
        id: 'starter_monthly',
        name: 'Starter',
        price: 29,
        billing: 'monthly' as const,
        features: ['basic-terminal', 'ai-assistance', 'file-operations'],
        description: 'Starter plan - $29/month',
        comingSoon: false,
        soldOut: false
    },
    CREATOR: {
        id: 'creator_monthly',
        name: 'Creator',
        price: 69,
        billing: 'monthly' as const,
        features: ['all-features', 'advanced-ai', 'priority-support'],
        description: 'Creator plan - $69/month',
        comingSoon: false,
        soldOut: false
    },
    PRO: {
        id: 'pro_monthly',
        name: 'Pro',
        price: 99,
        billing: 'monthly' as const,
        features: ['all-features', 'priority-support', 'enterprise-ai'],
        description: 'Pro plan - $99/month',
        comingSoon: false,
        soldOut: false
    },
    FOUNDER_LIFETIME: {
        id: 'founder_lifetime',
        name: 'Founder Lifetime',
        price: 699,
        billing: 'one-time' as const,
        features: ['all-features', 'lifetime-access', 'priority-support'],
        description: 'Founder Lifetime - $699 one-time',
        comingSoon: false,
        soldOut: false
    },
    PIONEER_LIFETIME: {
        id: 'pioneer_lifetime',
        name: 'Pioneer Lifetime',
        price: 800,
        billing: 'one-time' as const,
        features: ['all-features', 'lifetime-access', 'priority-support', 'early-access'],
        description: 'Pioneer Lifetime - $800 one-time',
        comingSoon: false,
        soldOut: false
    },
    FINAL_LIFETIME: {
        id: 'final_lifetime',
        name: 'Final Lifetime',
        price: 999,
        billing: 'one-time' as const,
        features: ['all-features', 'lifetime-access', 'priority-support', 'early-access', 'premium-support'],
        description: 'Final Lifetime - $999 one-time',
        comingSoon: false,
        soldOut: false
    }
} as const;

export type PricingPlanId = keyof typeof PRICING_PLANS;
export type PricingPlan = (typeof PRICING_PLANS)[PricingPlanId];

export type BillingType = 'free' | 'monthly' | 'one-time' | 'coming_soon';

export interface LicenseInfo {
    planId: PricingPlanId;
    isActive: boolean;
    expiresAt?: Date;
    purchasedAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

export const getPurchasablePlans = (): PricingPlan[] => {
    return Object.values(PRICING_PLANS).filter(plan =>
        plan.billing !== 'free' && !plan.soldOut
    );
};

export const getPlanById = (planId: PricingPlanId): PricingPlan => {
    return PRICING_PLANS[planId];
};

export const isPlanPurchasable = (planId: PricingPlanId): boolean => {
    const plan = PRICING_PLANS[planId];
    return plan.billing !== 'free' && !plan.soldOut;
};

export const getActivePricingPlans = (): PricingPlan[] => {
    return [
        PRICING_PLANS.FREE,
        PRICING_PLANS.STARTER,
        PRICING_PLANS.CREATOR,
        PRICING_PLANS.PRO,
        PRICING_PLANS.FOUNDER_LIFETIME,
        PRICING_PLANS.PIONEER_LIFETIME,
        PRICING_PLANS.FINAL_LIFETIME
    ];
};

export const getStripePriceIds = () => ({
    STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    CREATOR_MONTHLY: process.env.STRIPE_PRICE_CREATOR_MONTHLY || 'price_creator_monthly',
    PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    FOUNDER_LIFETIME: process.env.STRIPE_PRICE_FOUNDER_LIFETIME || 'price_founder_lifetime',
    PIONEER_LIFETIME: process.env.STRIPE_PRICE_PIONEER_LIFETIME || 'price_pioneer_lifetime',
    FINAL_LIFETIME: process.env.STRIPE_PRICE_FINAL_LIFETIME || 'price_final_lifetime',
});
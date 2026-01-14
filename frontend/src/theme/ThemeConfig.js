import {
    Coffee, Car, ShoppingBag, Heart, Zap, Home, GraduationCap, Plane, Receipt, HelpCircle
} from 'lucide-react';

export const CATEGORIES = {
    'Food & Dining': {
        icon: Coffee,
        color: 'var(--color-cat-food)',
        label: 'Food & Dining'
    },
    'Transportation': {
        icon: Car,
        color: 'var(--color-cat-transport)',
        label: 'Transportation'
    },
    'Shopping': {
        icon: ShoppingBag,
        color: 'var(--color-cat-shopping)',
        label: 'Shopping'
    },
    'Entertainment': {
        icon: Heart,
        color: 'var(--color-cat-entertainment)',
        label: 'Entertainment'
    },
    'Healthcare': {
        icon: Heart,
        color: 'var(--color-cat-healthcare)',
        label: 'Healthcare'
    },
    'Utilities': {
        icon: Zap,
        color: 'var(--color-cat-utilities)',
        label: 'Utilities'
    },
    'Housing': {
        icon: Home,
        color: 'var(--color-cat-housing)',
        label: 'Housing'
    },
    'Education': {
        icon: GraduationCap,
        color: 'var(--color-cat-education)',
        label: 'Education'
    },
    'Travel': {
        icon: Plane,
        color: 'var(--color-cat-travel)',
        label: 'Travel'
    },
    'Other': {
        icon: Receipt,
        color: 'var(--color-cat-other)',
        label: 'Other'
    }
};

export const getCategoryConfig = (categoryName) => {
    return CATEGORIES[categoryName] || {
        icon: HelpCircle,
        color: 'var(--color-cat-other)',
        label: categoryName
    };
};

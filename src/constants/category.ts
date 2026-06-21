export const CATEGORY_EMOJI: Record<string, string> = {
    HAMBURGER: '🍔',
    CHICKEN: '🍗',
    FRIES: '🍟',
    DRINK: '🥤',
    DESSERT: '🍰',
    SNACK: '🥨',
    SALAD: '🥗',
    SAUCE: '🥫',
    WRAP: '🌯',
    BREAKFAST: '🍳',
    ICE_CREAM: '🍦',
};

export const DEFAULT_CATEGORY_EMOJI = "🍽️";

export function getCategoryEmoji(categoryName: string): string {
    return CATEGORY_EMOJI[categoryName.toUpperCase()] ?? DEFAULT_CATEGORY_EMOJI;
}

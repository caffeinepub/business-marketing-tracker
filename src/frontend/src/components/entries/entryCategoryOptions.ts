import { CraftCategory } from '@/backend';

export interface CategoryOption {
  value: CraftCategory;
  label: string;
}

export const CRAFT_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: CraftCategory.SplatterRoom, label: 'Splatter Room' },
  { value: CraftCategory.CandleMaking, label: 'Candle Making' },
  { value: CraftCategory.SoapMaking, label: 'Soap Making' },
];

export function getCraftCategoryLabel(category: CraftCategory): string {
  const option = CRAFT_CATEGORY_OPTIONS.find((opt) => opt.value === category);
  return option?.label || category;
}

import { BaseCocaineMix, BaseMethType, BaseVariety } from "../types/variety";

export const baseVarieties: Record<string, BaseVariety> = {
  ogkush: { seedCost: 30, budPrice: 57, name: 'Og Kush'},
  sourdiesel: { seedCost: 35, budPrice: 63, name: 'Sour Diesel'},
  granddaddypurple: { seedCost: 40, budPrice: 64, name: 'Granddaddy Purple'},
  greencrack: { seedCost: 40, budPrice: 64, name: 'Green Crack'},
} as const;

export const baseMethTypes: Record<string, BaseMethType> = {
  meth: { crystalPrice: 70, name: 'Meth'},
}

export const baseCocaineMixes: Record<string, BaseCocaineMix> = {
  cocaine: { price: 150, name: 'Cocaine'},
}
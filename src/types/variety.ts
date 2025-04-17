export type BaseVariety = {
    name: string;
    budPrice: number;
    seedCost: number;
}

export type Variety = {
    name: string;
    id: string;
    base: string;
    budPrice: number;
    mixSteps: {product: string, mixer: string}[];
    ingredientCost: number;
    seedCost: number;
}

export type ComputedVariety = {
    id: string;
    name: string;
    base: string;
    budPrice?: number;
    mixSteps: {product: string, mixer: string}[];
    mixStepsAmount: number;
    ingredientCost: number;
    totalCost: number;
    profitPerBud: number;
    profitPerBatch: number;
    seedCost?: number;
    profitPerDay: number;
    maxProductionPerDay: number;
    productionPerDay: number;
    timePerBatch?: number;
    mixTime?: number;
}

export type RawVariety = {
    name: string;
    id: string;
    type: number;
    properties: string[];
    dataType: string;
    gameVersion: string;
    recipe?: {
        product: string;
        mixer: string;
    },
    sellPrice: number;
}

export type BaseMethType = {
    name: string;
    crystalPrice: number;
}

export type MethType = {
    id: string;
    name: string;
    crystalPrice: number;
    mixSteps: {product: string, mixer: string}[];
    ingredientCost: number;
}

export type ComputedMethType = {
    id: string;
    name: string;
    mixSteps: {product: string, mixer: string}[];
    mixStepsAmount: number;
    ingredientCost: number;
    totalCost: number;
    profitPerCrystal: number;
    profitPerBatch: number;
    crystalPrice: number;
    profitPerDay: number;
    maxProductionPerDay: number;
    productionPerDay: number;
    timePerBatch?: number;
    mixTime?: number;
}

export type BaseCocaineMix = {
    name: string;
    price: number;
}

export type CocaineMix = {
    name: string;
    price?: number;
    mixSteps: {product: string, mixer: string}[];
    ingredientCost: number;
}

export type ComputedCocaineMix = {
    name: string;
    base: string;
    mixSteps: {product: string, mixer: string}[];
    ingredientCost: number;
    totalCost: number;
    profitPerUnit: number;
    profitPerBatch: number;
    price: number;
}

export type Product = Variety | MethType | CocaineMix;
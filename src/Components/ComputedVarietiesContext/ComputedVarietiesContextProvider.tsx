import { useEffect, useMemo, useState } from "react";
import { WEED_GROWING_OBJECTS } from "../../helpers/parseSaveFile";
import { Customer } from "../../types/NPC";
import { Property, PropertyObject } from "../../types/property";
import { ComputedVariety, Variety } from "../../types/variety";
import ComputedVarietiesContext from "./ComputedVarietiesContext";

function computeProductValues(
  products: Variety[],
  pots: number,
  mixingMachines: number,
  demand: number,
  margin: number,
) {
  const HOURS_IN_DAY = 24;
  const GROW_TIME = 10.5;
  const MIX_TIME = 1;
  const FIXED_COST = products[0].seedCost + (60 / 3); // 60 for the soil, assuming "High Quality" soil, 3 uses, 1 use per batch

  return products.map(product => {
    const batchCost = FIXED_COST + product.ingredientCost;
    const profitPerBatch = (product.budPrice * 8) - batchCost;
    const profitPerUnit = profitPerBatch / 8;
    const ratioCostBenefit = profitPerUnit / batchCost;
    const growthThroughput = Math.floor(pots * HOURS_IN_DAY / GROW_TIME); // max growing volume (in batch)
    const mixThroughput = Math.floor(mixingMachines * HOURS_IN_DAY / MIX_TIME); // max mixing volume (in batch)
    const maxProductionPerDay = product.mixSteps.length > 0 ? Math.min(growthThroughput, mixThroughput) : growthThroughput;
    const productionPerDay = Math.min(demand + margin, maxProductionPerDay * 8);
    const mixSteps = product.mixSteps.length;
    const profitPerDay = profitPerUnit * productionPerDay;

    return {
      ...product,
      name: product.name,
      totalCost: batchCost,
      profitPerBatch: profitPerBatch,
      profitPerBud: profitPerUnit,
      ratioCostBenefit: ratioCostBenefit,
      timePerBatch: GROW_TIME + (MIX_TIME * mixSteps),
      mixTime: MIX_TIME * mixSteps,
      mixStepsAmount: mixSteps,
      maxProductionPerDay: maxProductionPerDay,
      productionPerDay: productionPerDay,
      profitPerDay: profitPerDay,
    };
  });
}


type ComputedVarietiesProviderProps = {
    varieties: Variety[];
    property: Property;
    children?: React.ReactNode;
    customers: Customer[];
    defaultPotsUsed?: number;
    defaultMixingMachinesUsed?: number;
}

const ComputedVarietiesProvider = ({varieties, property, customers, defaultPotsUsed, defaultMixingMachinesUsed, children}: ComputedVarietiesProviderProps) => {
    const [potsToUse, setPotsToUse] = useState<number | null>(defaultPotsUsed ?? null);
    const [mixingMachinesToUse, setMixingMachinesToUse] = useState<number | null>(defaultMixingMachinesUsed ?? null);

    useEffect(() => {
      setPotsToUse(null);
      setMixingMachinesToUse(null);
    }, [property.id])

    const computedVarieties: {varieties: ComputedVariety[], isSuggested: boolean, mixingMachineUsed: number, potsUsed: number } = useMemo(() => {
      console.log({varieties });
      const totalAverageOrderQuantity = customers.length * 5; // assuming each customer buys 5 items per day
      const totalObjectsMap = property.objects.reduce((acc: Record<string, number>, propertyObject: PropertyObject) => {
        if (propertyObject) {
          acc[propertyObject.id] = (acc[propertyObject.id] || 0) + propertyObject.amount;
        }
        return acc;
      }, {});
      const propertyMixingMachines = Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (key.includes("mixingstation")) {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);
      const mixingMachines = propertyMixingMachines > 0 ? mixingMachinesToUse ?? propertyMixingMachines : mixingMachinesToUse || 0;
      const weedGrowingObjects = Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (WEED_GROWING_OBJECTS.includes(key)) {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);
      const pots = weedGrowingObjects > 0 ? potsToUse ?? weedGrowingObjects : potsToUse || 0;
      const newVarieties = computeProductValues(varieties, pots, mixingMachines, totalAverageOrderQuantity, 0);
      const varietyWithMaxProfitPerDay = newVarieties.sort((a, b) => b.profitPerDay - a.profitPerDay)?.[0];
      return {
        varieties: pots > 0 ? newVarieties : [varietyWithMaxProfitPerDay],
        isSuggested: pots === 0,
        mixingMachineUsed: mixingMachines,
        potsUsed: pots,
      }
    }, [customers.length, mixingMachinesToUse, potsToUse, property.objects, varieties]);
  
    return (
        <ComputedVarietiesContext.Provider value={{...computedVarieties, setPotsToUse, setMixingMachinesToUse}}>
            {children}
        </ComputedVarietiesContext.Provider>
    );
}
export default ComputedVarietiesProvider;
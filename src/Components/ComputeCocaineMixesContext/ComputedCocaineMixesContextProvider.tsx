import { useEffect, useMemo, useState } from "react";
import { WEED_GROWING_OBJECTS } from "../../helpers/parseSaveFile";
import { Customer } from "../../types/NPC";
import { Property, PropertyObject } from "../../types/property";
import { CocaineMix, ComputedCocaineMix } from "../../types/variety";
import ComputedCocaineMixesContext from "./ComputeCocaineMixesContext";

function computeProductValues(
  products: CocaineMix[],
  pots: number,
  cauldrons: number,
  labOvens: number,
  mixingMachines: number,
  demand: number,
  margin: number,
) {
  const HOURS_IN_DAY = 24;
  const GROW_TIME = 29;
  const PREPARATION_TIME = 7;
  const COOK_TIME = 5;
  const MIX_TIME = 1;
  const FIXED_COST = 80 + 80; // 80 for the pseudo, 80 for the two other ingredients

  return products.map(product => {
    const batchCost = FIXED_COST + product.ingredientCost;
    const profitPerBatch = (product.price * 10) - batchCost;
    const profitPerUnit = profitPerBatch / 10;
    const ratioCostBenefit = profitPerUnit / batchCost;
    const growthThroughput = Math.floor(pots * HOURS_IN_DAY / GROW_TIME); // max growing volume (in batch)
    const preparationThroughput = Math.floor(cauldrons * HOURS_IN_DAY / PREPARATION_TIME); // max preparation volume (in batch)
    const cookThroughput = Math.floor(labOvens * HOURS_IN_DAY / COOK_TIME); // max cooking volume (in batch)
    const mixThroughput = Math.floor(mixingMachines * HOURS_IN_DAY / MIX_TIME); // max mixing volume (in batch)

    const maxProductionPerDay = product.mixSteps.length > 0 ? Math.min(preparationThroughput, cookThroughput, mixThroughput, growthThroughput) : Math.min(cookThroughput, growthThroughput, preparationThroughput);

    const productionPerDay = Math.min(demand + margin, maxProductionPerDay * 10);
    const mixSteps = product.mixSteps.length;
    const profitPerDay = profitPerUnit * productionPerDay;

    return {
      ...product,
      name: product.name,
      totalCost: batchCost,
      profitPerBatch: profitPerBatch,
      profitPerUnit: profitPerUnit,
      ratioCostBenefit: ratioCostBenefit,
      timePerBatch: Math.max(COOK_TIME, COOK_TIME) + MIX_TIME,
      mixTime: MIX_TIME * mixSteps,
      mixStepsAmount: mixSteps,
      maxProductionPerDay: maxProductionPerDay,
      productionPerDay: productionPerDay,
      profitPerDay: profitPerDay,
    };
  });
}


type ComputedCocaineMixProviderProps = {
  cocaineMixes: CocaineMix[];
  property: Property;
  children?: React.ReactNode;
  customers: Customer[];
}

const ComputedCocaineMixesProvider = ({cocaineMixes, property, customers, children}: ComputedCocaineMixProviderProps) => {
    const [potsToUse, setPotsToUse] = useState<number | null>(null);
    const [cauldronsToUse, setCauldronsToUse] = useState<number | null>(null);
    const [mixingMachinesToUse, setMixingMachinesToUse] = useState<number | null>(null);
    const [labOvensToUse, setLabOvensToUse] = useState<number | null>(null);

    useEffect(() => {
      setCauldronsToUse(null);
      setMixingMachinesToUse(null);
      setLabOvensToUse(null);
    }, [property.id])

    const computedCocaineMixes: {cocaineMixes: ComputedCocaineMix[], isSuggested: boolean, mixingMachineUsed: number, cauldronsUsed: number, labOvensUsed: number, potsUsed: number } = useMemo(() => {
      const totalAverageOrderQuantity = customers.length * 1; // assuming each customer buys 1 items per day
      const totalObjectsMap = property.objects.reduce((acc: Record<string, number>, propertyObject: PropertyObject) => {
        if (propertyObject) {
          acc[propertyObject.id] = (acc[propertyObject.id] || 0) + propertyObject.amount;
        }
        return acc;
      }, {});
      const mixingMachines = mixingMachinesToUse ?? Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (key.includes("mixingstation")) {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);
      const hovenObjects = labOvensToUse ?? Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (key.includes("laboven")) {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);
      const cauldronsObjects = cauldronsToUse ?? Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (key === 'cauldron') {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);
      const potsObjects = potsToUse ?? Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (WEED_GROWING_OBJECTS.includes(key)) {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);
      const newVarieties = computeProductValues(cocaineMixes, potsObjects, cauldronsObjects, hovenObjects, mixingMachines, totalAverageOrderQuantity, 0);
      const varietyWithMaxProfitPerDay = newVarieties.sort((a, b) => b.profitPerDay - a.profitPerDay)?.[0];
      return {
        cocaineMixes: cauldronsObjects > 0 ? newVarieties : [varietyWithMaxProfitPerDay],
        isSuggested: cauldronsObjects === 0,
        mixingMachineUsed: mixingMachines,
        cauldronsUsed: cauldronsObjects,
        labOvensUsed: hovenObjects,
        potsUsed: potsObjects
      }
    }, [customers.length, property.objects, mixingMachinesToUse, labOvensToUse, cauldronsToUse, potsToUse, cocaineMixes]);
  
    return (
        <ComputedCocaineMixesContext.Provider value={{...computedCocaineMixes, setCauldronsToUse, setMixingMachinesToUse, setLabOvensToUse, setPotsToUse }}>
            {children}
        </ComputedCocaineMixesContext.Provider>
    );
}
export default ComputedCocaineMixesProvider;
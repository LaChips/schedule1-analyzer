import { useEffect, useMemo, useState } from "react";
import { Customer } from "../../types/NPC";
import { Property, PropertyObject } from "../../types/property";
import { ComputedMethType, MethType } from "../../types/variety";
import ComputedMethMixesContext from "./ComputedMethMixesContext";

function computeProductValues(
  products: MethType[],
  chemistryStations: number,
  labOvens: number,
  mixingMachines: number,
  demand: number,
  margin: number,
) {
  const HOURS_IN_DAY = 24;
  const GATHER_TIME = 8;
  const TRANSFORM_TIME = 5;
  const MIX_TIME = 1;
  const FIXED_COST = 80 + 80; // 80 for the pseudo, 80 for the two other ingredients

  return products.map(product => {
    // Step 1: Compute batch cost
    const batchCost = FIXED_COST + product.ingredientCost;

    // Step 2: Compute profit per batch
    const profitPerBatch = (product.crystalPrice * 10) - batchCost;

    // Step 3: Compute profit per unit
    const profitPerUnit = profitPerBatch / 10;

    // Step 4: Compute ratio cost-benefit
    const ratioCostBenefit = profitPerUnit / batchCost;

    // Step 5: Compute time per batch
    const gatherThroughput = Math.floor(chemistryStations * HOURS_IN_DAY / GATHER_TIME); // max batches by gathering
    const transformThroughput = Math.floor(labOvens * HOURS_IN_DAY / TRANSFORM_TIME); // max batches by transforming
    const mixThroughput = Math.floor(mixingMachines * HOURS_IN_DAY / MIX_TIME); // max batches by mixing

    const maxProductionPerDay = product.mixSteps.length > 0 ? Math.min(gatherThroughput, transformThroughput, mixThroughput) : transformThroughput;

    const productionPerDay = Math.min(demand + margin, maxProductionPerDay * 10);

    // Step 6: Mixing steps (the length of the array)
    const mixSteps = product.mixSteps.length;

    // Step 7: Compute profit per day
    const profitPerDay = profitPerUnit * productionPerDay;

    return {
      ...product,
      name: product.name,
      totalCost: batchCost,
      profitPerBatch: profitPerBatch,
      profitPerCrystal: profitPerUnit,
      ratioCostBenefit: ratioCostBenefit,
      timePerBatch: Math.max(GATHER_TIME, TRANSFORM_TIME) + MIX_TIME, // gathering + transforming + mixing
      mixTime: MIX_TIME * mixSteps,
      mixStepsAmount: mixSteps,
      maxProductionPerDay: maxProductionPerDay,
      productionPerDay: productionPerDay,
      profitPerDay: profitPerDay,
    };
  });
}


type ComputedMethTypeProviderProps = {
  methMixes: MethType[];
  property: Property;
  children?: React.ReactNode;
  customers: Customer[];
}

const ComputedVarietiesProvider = ({methMixes, property, customers, children}: ComputedMethTypeProviderProps) => {
    const [chemistryStationsToUse, setChemistryStationsToUse] = useState<number | null>(null);
    const [mixingMachinesToUse, setMixingMachinesToUse] = useState<number | null>(null);
    const [labOvensToUse, setLabOvensToUse] = useState<number | null>(null);

    useEffect(() => {
      setChemistryStationsToUse(null);
      setMixingMachinesToUse(null);
      setLabOvensToUse(null);
    }, [property.id])

    const computedMethMixes: {methMixes: ComputedMethType[], isSuggested: boolean, mixingMachineUsed: number, chemistryStationsUsed: number, labOvensUsed: number } = useMemo(() => {
      const totalAverageOrderQuantity = customers.length * 5; // assuming each customer buys 5 items per day
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
      const chemistryStationObjects = chemistryStationsToUse ?? Object.keys(totalObjectsMap).reduce((acc: number, key: string) => {
        if (key === 'chemistrystation') {
          acc += totalObjectsMap[key];
        }
        return acc;
      }, 0);

      const newVarieties = computeProductValues(methMixes, chemistryStationObjects, hovenObjects, mixingMachines, totalAverageOrderQuantity, 0);
      const varietyWithMaxProfitPerDay = newVarieties.sort((a, b) => b.profitPerDay - a.profitPerDay)?.[0];
      return {
        methMixes: chemistryStationObjects > 0 ? newVarieties : [varietyWithMaxProfitPerDay],
        isSuggested: chemistryStationObjects === 0,
        mixingMachineUsed: mixingMachines,
        chemistryStationsUsed: chemistryStationObjects,
        labOvensUsed: hovenObjects,
      }
    }, [customers.length, property.objects, mixingMachinesToUse, labOvensToUse, chemistryStationsToUse, methMixes]);
  
    return (
        <ComputedMethMixesContext.Provider value={{...computedMethMixes, setChemistryStationsToUse, setMixingMachinesToUse, setLabOvensToUse}}>
            {children}
        </ComputedMethMixesContext.Provider>
    );
}
export default ComputedVarietiesProvider;
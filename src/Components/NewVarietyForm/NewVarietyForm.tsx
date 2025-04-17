import React, { useCallback } from "react";

import { baseVarieties } from "../../helpers/BaseVarieties";
import { Variety } from "../../types/variety";

type NewVarietyFormProps = {
  addVariety: (newVariety: Variety) => void;
};

const NewVarietyForm = ({ addVariety }: NewVarietyFormProps) => {
  const [newVariety, setNewVariety] = React.useState<Variety>({
    name: "",
    base: "ogkush",
    budPrice: 0,
    mixSteps: [],
    ingredientCost: 0,
    seedCost: 0,
  });

  const handleAddVariety = useCallback(
    () => {
      if (!newVariety?.name || !newVariety?.budPrice) return;
      const baseData = baseVarieties[newVariety.base];
      const newVarietyData = {
        ...newVariety,
        seedCost: baseData.seedCost,
        budPrice: newVariety.budPrice,
        mixSteps: newVariety.mixSteps,
        ingredientCost: newVariety.ingredientCost,
      };
      addVariety(newVarietyData);
      setNewVariety({
        name: "",
        base: "",
        budPrice: 0,
        mixSteps: [{
          product: "ogkush",
          mixer: 'cuke'
        }],
        ingredientCost: 0,
        seedCost: 0,
      });
    },
    [addVariety, newVariety]
  );

  return (
    <>
      <h2>Add New Variety</h2>
      <input
        type="text"
        placeholder="Name"
        value={newVariety.name}
        onChange={(e) => setNewVariety({ ...newVariety, name: e.target.value })}
      />
      <select
        value={newVariety?.base}
        onChange={(e) => setNewVariety({ ...newVariety, base: e.target.value })}
      >
        {Object.keys(baseVarieties).map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Bud Price"
        value={newVariety.budPrice}
        onChange={(e) =>
          setNewVariety({ ...newVariety, budPrice: parseFloat(e.target.value ?? 0) })
        }
      />
      <input
        type="number"
        placeholder="Ingredient Cost"
        value={newVariety.ingredientCost}
        onChange={(e) =>
          setNewVariety({ ...newVariety, ingredientCost: parseFloat(e.target.value ?? 0) })
        }
      />
      <button onClick={handleAddVariety}>Add Variety</button>
    </>
  );
};

export default NewVarietyForm;

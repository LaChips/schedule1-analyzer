import { createContext } from "react";
import { ComputedVariety } from "../../types/variety";


const ComputedVarietiesContext = createContext<{
    varieties: (ComputedVariety)[],
    isSuggested: boolean,
    mixingMachineUsed: number,
    potsUsed: number,
    setPotsToUse: (amount: number) => void,
    setMixingMachinesToUse: (amount: number) => void
}>({
    varieties: [], isSuggested: false, mixingMachineUsed: 0, potsUsed: 0
    , setPotsToUse: () => { }, setMixingMachinesToUse: () => { }
});

export default ComputedVarietiesContext;
import { createContext } from "react";
import { ComputedCocaineMix } from "../../types/variety";


const ComputedCocaineMixesContext = createContext<{
    cocaineMixes: ComputedCocaineMix[],
    isSuggested: boolean,
    mixingMachineUsed: number,
    cauldronsUsed: number,
    labOvensUsed: number,
    potsUsed: number,
    setCauldronsToUse: (amount: number) => void,
    setMixingMachinesToUse: (amount: number) => void,
    setLabOvensToUse: (amount: number) => void,
    setPotsToUse: (amount: number) => void,
}>({
    cocaineMixes: [],
    isSuggested: false,
    mixingMachineUsed: 0,
    cauldronsUsed: 0,
    labOvensUsed: 0,
    potsUsed: 0,
    setCauldronsToUse: () => { },
    setMixingMachinesToUse: () => { },
    setLabOvensToUse: () => { },
    setPotsToUse: () => { }
});

export default ComputedCocaineMixesContext;
import { createContext } from "react";
import { ComputedMethType } from "../../types/variety";


const ComputedMethMixesContext = createContext<{
    methMixes: (ComputedMethType)[],
    isSuggested: boolean,
    mixingMachineUsed: number,
    chemistryStationsUsed: number,
    labOvensUsed: number,
    setChemistryStationsToUse: (amount: number) => void,
    setMixingMachinesToUse: (amount: number) => void,
    setLabOvensToUse: (amount: number) => void,
}>({
    methMixes: [],
    isSuggested: false,
    mixingMachineUsed: 0,
    chemistryStationsUsed: 0,
    labOvensUsed: 0,
    setChemistryStationsToUse: () => { },
    setMixingMachinesToUse: () => { },
    setLabOvensToUse: () => { }
});

export default ComputedMethMixesContext;
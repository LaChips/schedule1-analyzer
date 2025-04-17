import { SaveVariables } from "./game";
import { Property } from "./property";
import { MethType, Variety } from "./variety";

export type SaveFile = {
    gameData: SaveVariables;
    properties: Property[];
    varieties: Variety[];
    methMixes: MethType[];
}
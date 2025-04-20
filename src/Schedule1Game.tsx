import { useState } from "react";
import DealersList from "./Components/DealersList";
import LoadSaveFileModal from "./Components/LoadSaveFileModal";
import SaveFileOverview from "./Components/SaveFileOverview";
import { baseCocaineMixes, baseMethTypes, baseVarieties } from "./helpers/BaseVarieties";
import { SaveVariables } from "./types/game";
import { Customer, Dealer, Supplier } from "./types/NPC";
import { Property } from "./types/property";
import { CocaineMix, MethType, Variety } from "./types/variety";

import BestCocaineMixes from "./Components/BestCocaineMixes";
import BestMethMixes from "./Components/BestMethMixes";
import BestVarieties from "./Components/BestVarieties";
import styles from "./Schedule1Game.module.css";

const Schedule1Game = () => {
  const [saveFileLoaded, setSaveFileLoaded] = useState(false);
  const [gameData, setGameVariables] = useState<SaveVariables>();
  const [properties, setProperties] = useState<Property[]>();
  const [npcs, setNpcs] = useState<{dealers: Dealer[], customers: Customer[], suppliers: Supplier[]}>();
  const [varieties, setVarieties] = useState<Variety[]>(
    Object.keys(baseVarieties).map((b) => ({
      name: baseVarieties[b].name,
      base: '-',
      budPrice: baseVarieties[b].budPrice,
      mixSteps: [],
      ingredientCost: 0,
      seedCost: baseVarieties[b].seedCost,
      id: b
    }))
  );
  const [methMixes, setMethMixes] = useState<MethType[]>(
    Object.keys(baseMethTypes).map((b) => ({
      name: b,
      crystalPrice: baseMethTypes[b].crystalPrice,
      mixSteps: [],
      ingredientCost: 0,
      id: b,
    }))
  );
  const [cocaineMixes, setCocaineMixes] = useState<CocaineMix[]>(
    Object.keys(baseCocaineMixes).map((b) => ({
      name: b,
      price: baseCocaineMixes[b].price,
      mixSteps: [],
      ingredientCost: 0,
      id: b,
    }))
  );

  if (!saveFileLoaded) {
    return (
    <>
      <h1>Schedule 1 Optimizer</h1>
      <div className={styles.step}>
        <div className={styles.stepCounter}>1.</div>
        <div className={styles.stepTextContainer}>
          <span className={styles.stepText}>Browse to <span className={styles.path}>C:/Users/[yourusername]/AppData/LocalLow/TVGS/Schedule I/Saves/[yoursave]/</span>.</span>
          <span className={styles.stepText}>You should have 1 folder and 2 files; steam_autocloud.vdf, WriteTest.txt and a folder (e.g SaveGame_1).</span>
        </div>
      </div>
      <div className={styles.step}>
        <div className={styles.stepCounter}>2.</div>
        <div className={styles.stepTextContainer}>
          <span className={styles.stepText}>Create a zip archive of the save folder (e.g SaveGame_1.zip)</span>
        </div>
      </div>
      <div className={styles.step}>
        <div className={styles.stepCounter}>3.</div>
        <div className={styles.stepTextContainer}>
          <span className={styles.stepText}>Upload the zip archive here:</span>
        </div>
      </div>
      <LoadSaveFileModal
        onSave={({varieties, methMixes, cocaineMixes, gameData, properties, npcs }) => {
          setVarieties(varieties);
          setMethMixes(methMixes);
          setCocaineMixes(cocaineMixes);
          setGameVariables(gameData);
          setProperties(properties);
          setNpcs(npcs);
          setSaveFileLoaded(true);
        }}
      />
      
      <span>Note: The save file is not uploaded anywhere, it is only analyzed locally.</span>
    </>
    );
  }

  if (!gameData || !properties) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SaveFileOverview data={{ gameData, properties, varieties, methMixes }} />
      <DealersList dealers={npcs?.dealers || []} allCustomers={npcs?.customers || []} />
      <BestVarieties properties={properties} customers={npcs?.customers || []} varieties={varieties} />
      <BestMethMixes properties={properties} customers={npcs?.customers || []} methMixes={methMixes} />
      <BestCocaineMixes properties={properties} customers={npcs?.customers || []} cocaineMixes={cocaineMixes} />
      {/* <h2>Varieties</h2>
      <VarietyList varieties={varieties} />

      <h2>Meth mixes</h2>
      <MethList methTypes={methMixes} /> */}
    </div>
  );
};

export default Schedule1Game;

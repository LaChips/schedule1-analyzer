import React, { MouseEventHandler, useCallback } from "react";

import CocaineIcon from "../../assets/icons/Cocaine";
import CustomerIcon from "../../assets/icons/Customer";
import DealerIcon from "../../assets/icons/Dealer";
import EmployeeIcon from "../../assets/icons/Employee";
import MethIcon from "../../assets/icons/Meth";
import PropertyIcon from "../../assets/icons/Property";
import SupplierIcon from "../../assets/icons/Supplier";
import WeedIcon from "../../assets/icons/Weed";
import { prettyNumber } from "../../helpers/numbers";
import { parseSaveFile } from "../../helpers/parseSaveFile";
import { SaveVariables } from "../../types/game";
import { Customer, Dealer, Supplier } from "../../types/NPC";
import { Property } from "../../types/property";
import { CocaineMix, MethType, Variety } from "../../types/variety";
import Modal from "../Modal";
import styles from "./LoadSaveFileModal.module.css";

type LoadSaveFileModaProps = {
    onSave: ({
        varieties,
        methMixes,
        cocaineMixes,
        gameData,
        properties
    }: {
        varieties: Variety[],
        methMixes: MethType[],
        cocaineMixes: CocaineMix[],
        gameData: SaveVariables,
        properties: Property[],
        npcs: {dealers: Dealer[], customers: Customer[], suppliers: Supplier[]}
    }) => void;
    trigger?: (onClick: MouseEventHandler<HTMLButtonElement>) => React.ReactNode;
}

const LoadSaveFileModal = ({
    onSave,
    trigger,
}: LoadSaveFileModaProps) => {
    const [parsedVarieties, setParsedVarieties] = React.useState<Variety[]>([]);
    const [parsedMethTypes, setParsedMethTypes] = React.useState<MethType[]>([]);
    const [parsedCocaineMixes, setParsedCocaineMixes] = React.useState<CocaineMix[]>([]);
    const [parsedCustomers, setParsedCustomers] = React.useState<Customer[]>([]);
    const [parsedSuppliers, setParsedSuppliers] = React.useState<Supplier[]>([]);
    const [parsedDealers, setParsedDealers] = React.useState<Dealer[]>([]);
    const [parsedGameData, setParsedGameData] = React.useState<SaveVariables>();
    const [parsedProperties, setParsedProperties] = React.useState<Property[]>([]);
    const [archiveParsed, setArchiveParsed] = React.useState(false);

    const handleSave = () => {
        onSave({varieties: parsedVarieties, methMixes: parsedMethTypes, cocaineMixes: parsedCocaineMixes, gameData: parsedGameData!, properties: parsedProperties, npcs: {dealers: parsedDealers, customers: parsedCustomers, suppliers: parsedSuppliers}});
        setParsedVarieties([]);
        setParsedMethTypes([]);
        setParsedCocaineMixes([]);
        setParsedCustomers([]);
        setParsedSuppliers([]);
        setParsedDealers([]);
        setParsedGameData(undefined);
        setParsedProperties([]);
    }

    const parseFile = useCallback(async (file: File) => {
        const parsedSaveFile = await parseSaveFile(file);
        if (!parsedSaveFile) return;
        const { varieties, methTypes, cocaineMixes, npcs, gameData, properties } = parsedSaveFile;
        if (!varieties) return;
        setParsedVarieties(varieties);
        setParsedMethTypes(methTypes);
        setParsedCocaineMixes(cocaineMixes);
        setParsedCustomers(npcs.customers);
        setParsedSuppliers(npcs.suppliers);
        setParsedDealers(npcs.dealers);
        setParsedGameData(gameData);
        setParsedProperties(properties);
        setArchiveParsed(true);
    }, []);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            parseFile(file);
        }
    }, [parseFile]);

    const handleDrop = useCallback(async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            parseFile(file);
        }
    }, [parseFile]);

    if (!archiveParsed) {
        return (
            <label htmlFor="archive" className={styles.dropContainer} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <span className={styles.dropTitle}>Drop your archive here</span>
                or
                <input onChange={handleFileChange} type="file" id="archive" required />
            </label>
        );
    }
    
    return (
        <Modal
            isOpen
            title="Load Save File"
            onConfirm={handleSave}
            contentClassName={styles.modal}
            onClose={() => {
                setParsedVarieties([]);
                setParsedMethTypes([]);
                setParsedCustomers([]);
                setParsedSuppliers([]);
                setParsedDealers([]);
                setParsedGameData(undefined);
                setParsedProperties([]);
                setArchiveParsed(false);
            }}
            trigger={
                trigger
            }
        >
            <div className={styles.gameData}>
                <div className={styles.gameDataDescription}>
                    <span className={styles.gameDataKey}>Net Worth</span>
                    <span className={styles.gameDataValue}>{prettyNumber(parsedGameData?.player?.netWorth)}</span>
                </div>
                <div className={styles.gameDataDescription}>
                    <span className={styles.gameDataKey}>Money</span>
                    <span className={styles.gameDataValue}>{prettyNumber(parsedGameData?.player?.onlineBalance)}</span>
                </div>
                <div className={styles.gameDataDescription}>
                    <span className={styles.gameDataKey}>Rank</span>
                    <span className={styles.gameDataValue}>{parsedGameData?.player?.rank}</span>
                </div>
                <div className={styles.gameDataDescription}>
                    <span className={styles.gameDataKey}>Tier</span>
                    <span className={styles.gameDataValue}>{parsedGameData?.player?.tier}</span>
                </div>
                <div className={styles.gameDataDescription}>
                    <span className={styles.gameDataKey}>Total XP</span>
                    <span className={styles.gameDataValue}>{prettyNumber(parsedGameData?.player?.totalXp)}</span>
                </div>
                <div className={styles.gameDataDescription}>
                    <span className={styles.gameDataKey}>Elapsed days</span>
                    <span className={styles.gameDataValue}>{parsedGameData?.game.elapsedDays}</span>
                </div>
            </div>
            <div className={styles.importResultsContainer}>
                {parsedVarieties.length > 0 && (
                    <div className={styles.loadedProductTypeContainer}>
                        <WeedIcon className={styles.productIcon} />
                        <div className={styles.productDescription}><span className={styles.amount}>{parsedVarieties.length}</span><span className={styles.productType}>Varieties</span></div>
                    </div>
                )}
                {parsedMethTypes.length > 0 && (
                    <div className={styles.loadedProductTypeContainer}>
                        <MethIcon className={styles.productIcon} />
                        <div className={styles.productDescription}><span className={styles.amount}>{parsedMethTypes.length}</span><span className={styles.productType}>Meth mix</span></div>
                    </div>
                )}
                {parsedCocaineMixes.length > 0 && (
                    <div className={styles.loadedProductTypeContainer}>
                        <CocaineIcon className={styles.productIcon} />
                        <div className={styles.productDescription}><span className={styles.amount}>{parsedCocaineMixes.length}</span><span className={styles.productType}>Cocaine mix</span></div>
                    </div>
                )}
                {parsedSuppliers.length > 0 && (
                    <div className={styles.loadedProductTypeContainer}>
                        <SupplierIcon className={styles.productIcon} />
                        <div className={styles.productDescription}><span className={styles.amount}>{parsedSuppliers.length}</span><span className={styles.productType}>Suppliers</span></div>
                    </div>
                )}
                {parsedDealers.length > 0 && (
                    <div className={styles.loadedProductTypeContainer}>
                        <DealerIcon className={styles.productIcon} />
                        <div className={styles.productDescription}><span className={styles.amount}>{parsedDealers.length}</span><span className={styles.productType}>Dealers</span></div>
                    </div>
                )}
                {parsedCustomers.length > 0 && (
                    <div className={styles.loadedProductTypeContainer}>
                        <CustomerIcon className={styles.productIcon} />
                        <div className={styles.productDescription}><span className={styles.amount}>{parsedCustomers.length}</span><span className={styles.productType}>Customers</span></div>
                    </div>
                )}
                {parsedProperties.length > 0 && (
                    <>
                        <div className={styles.loadedProductTypeContainer}>
                            <PropertyIcon className={styles.productIcon} />
                            <div className={styles.productDescription}><span className={styles.amount}>{parsedProperties.length}</span><span className={styles.productType}>Properties</span></div>
                        </div>
                        <div className={styles.loadedProductTypeContainer}>
                            <EmployeeIcon className={styles.productIcon} />
                            <div className={styles.productDescription}><span className={styles.amount}>{parsedProperties.reduce((acc, property) => acc + property.employees.length, 0)}</span><span className={styles.productType}>Workers</span></div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}

export default LoadSaveFileModal;
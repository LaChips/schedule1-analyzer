import React, { useMemo } from "react";

import { Customer } from "../../types/NPC";
import { Property } from "../../types/property";
import { ComputedMethType, MethType } from "../../types/variety";

import ComputedMethMixesContext from "../ComputedMethMixesContext/ComputedMethMixesContext";
import ComputedMethMixesContextProvider from "../ComputedMethMixesContext/ComputedMethMixesContextProvider";
import Modal from "../Modal";
import styles from "./BestMethMixes.module.css";

type BestMethMixesProps = {
    methMixes: MethType[];
    properties: Property[];
    customers: Customer[];
};

const propertiesOrder = [
    "motelroom",
    'sweatshop'
]

const BestMethMixes = ({ methMixes, properties, customers }: BestMethMixesProps) => {
    const [selectedPropertyId, setSelectedPropertyId] = React.useState('');
    
    const sortedProperties = [...properties].sort((a, b) => {
        const indexA = propertiesOrder.indexOf(a.id);
        const indexB = propertiesOrder.indexOf(b.id);
        return indexB - indexA; // Sort based on the order in the array
    });

    const selectedProperty = selectedPropertyId ? properties.find((property) => property.id === selectedPropertyId) : sortedProperties[0];

    return (
        <div>
            <h2>Best meth mixes</h2>
            <div className={styles.propertyRow}>
                {sortedProperties.map((property) => (
                    <div key={property.id} className={styles.propertyOption}>
                        <button className={`${styles.property} ${selectedPropertyId === property.id ? styles.selected : ''}`} onClick={() => setSelectedPropertyId(property.id)}>
                            {property.name}
                        </button>
                    </div>
                ))}
            </div>
            {selectedProperty && (
                <div className={styles.bestVarietiesContainer}>
                    <ComputedMethMixesContextProvider property={selectedProperty} customers={customers} methMixes={methMixes}>
                        <PropertyResults />
                    </ComputedMethMixesContextProvider>
                </div>
            )}
        </div>
    )
}

const PropertyResults = () => {
    const { isSuggested, mixingMachineUsed, labOvensUsed, chemistryStationsUsed } = React.useContext(ComputedMethMixesContext);

    if (isSuggested) {
        return (
            <>

             {/* <div className={styles.emptyStateContainer}>
                 <div className={styles.emptyState}> */}
                    You do not have any pot to grow weed on this property.<br/>This is a suggestion assuming you have {chemistryStationsUsed} chemistry stations, {labOvensUsed} lab ovens and {mixingMachineUsed} mixing machine.<br /><br />
                 {/* </div> */}
                <TopMethMixesBySortType title={"Profit per day"} sortBy="profitPerDay" />
             {/* </div> */}
            </>
        )
    }

    return (
        <>
            Note that the profit per day is an estimate based on the number of chemistry stations, lab ovens, mixing machines and customers you have and with an optimized production (no halts).<br /><br />
            <div className={styles.topVarietiesTablesContainer}>
                <TopMethMixesBySortType title={"Profit per bud"} sortBy="profitPerCrystal" />
                <TopMethMixesBySortType title={"Profit per day"} sortBy="profitPerDay"/>
            </div>
        </>
    )
}

type TopMethMixesBySortTypeProps = {
    title: string;
    sortBy: Exclude<keyof ComputedMethType, 'mixSteps'>;
};

const TopMethMixesBySortType = ({ title, sortBy }: TopMethMixesBySortTypeProps) => {
    const [selectedMethMix, setSelectedMethMix] = React.useState<ComputedMethType | null>(null);
    const { methMixes, mixingMachineUsed, labOvensUsed, chemistryStationsUsed, setChemistryStationsToUse, setLabOvensToUse, setMixingMachinesToUse } = React.useContext(ComputedMethMixesContext);

    const sortedVarieties = useMemo(
        () => {
            return [...methMixes].sort((a, b) => {
            const valueA = a[sortBy as keyof Exclude<typeof a, 'mixSteps'>] || 0;
            const valueB = b[sortBy as keyof Exclude<typeof b, 'mixSteps'>] || 0;
            if (typeof valueA === "string" && typeof valueB === "string") {
                return valueB.localeCompare(valueA)
            }
            if (typeof valueA !== "number" || typeof valueB !== "number") {
                return 0;
            }
            return valueB - valueA;
            });
        },
        [sortBy, methMixes]
    );

    const topThreeMethMixes = useMemo(() => sortedVarieties.slice(0, 3), [sortedVarieties]);

    return (
        <>
        <div className={styles.topVarietiesContainer}>
            <span className={styles.label}>{title}</span>
            {sortBy === "profitPerDay" && (
                <div className={styles.info}>
                    <div className={styles.inlineInput}>
                        <span className={styles.label}>Chemistry stations</span>
                        <input
                            type="number"
                            value={chemistryStationsUsed}
                            onChange={(e) => setChemistryStationsToUse(Number(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inlineInput}>
                        <span className={styles.label}>Lab ovens</span>
                        <input
                            type="number"
                            value={labOvensUsed}
                            onChange={(e) => setLabOvensToUse(Number(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inlineInput}>
                        <span className={styles.label}>Mixing Machines</span>
                        <input
                            type="number"
                            value={mixingMachineUsed}
                            onChange={(e) => setMixingMachinesToUse(Number(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                </div>
            )}
            <div className={styles.methMixesTable}>
                {topThreeMethMixes.map((methMix, index) => (
                    <div key={methMix.name} className={styles.varietyRow} onClick={() => setSelectedMethMix(methMix)}>
                        <span className={styles.varietyName}>{methMix.name} ({Math.floor(methMix.productionPerDay)})</span>
                        <div className={styles.varietyInfo}>
                            <span className={styles.varietyValue}>${methMix[sortBy]}</span>
                            {index === 0 && <span className={styles.varietyRank}>🥇</span>}
                            {index === 1 && <span className={styles.varietyRank}>🥈</span>}
                            {index === 2 && <span className={styles.varietyRank}>🥉</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <Modal
            isOpen={!!selectedMethMix}
            onClose={() => setSelectedMethMix(null)}
            title={selectedMethMix?.name || ''}
            className={styles.modal}
            contentClassName={styles.modalContent}
            showConfirmButton={false}
        >
            <div className={styles.varietyDetails}>
                <h3>Details</h3>
                <p><strong>Price per bud:</strong> {selectedMethMix?.crystalPrice}</p>
                <p><strong>Ingredient cost per batch:</strong> ${(selectedMethMix?.ingredientCost || 0) * 8}</p>
                <p><strong>Profit per bud:</strong> ${selectedMethMix?.profitPerCrystal}</p>
                <p><strong>Profit per batch:</strong> ${selectedMethMix?.profitPerBatch}</p>
                <p><strong>Profit per day:</strong> ${selectedMethMix?.profitPerDay}</p>
                <p><strong>Production per day:</strong> {selectedMethMix?.productionPerDay}</p>
                <p><strong>Time per batch:</strong> {parseInt(`${selectedMethMix?.timePerBatch}`)}h{Math.round(((selectedMethMix?.timePerBatch || 0) % 1) * 60)}m</p>
                <p><strong>Mixing time per batch:</strong> {parseInt(`${selectedMethMix?.mixTime}`)}h{Math.round(((selectedMethMix?.mixTime || 0) % 1) * 60)}m</p>
                <div className={styles.varietyMixSteps}>
                    <h4>Mix Steps</h4>
                    <ul>
                        {([...selectedMethMix?.mixSteps || []])?.reverse().map((step, index) => (
                            <li key={index}>{methMixes.find((v) => v.id === step.product)?.name} + {step.mixer}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Modal>
    </>
    );
}

export default BestMethMixes;
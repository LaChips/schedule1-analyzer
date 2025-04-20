import React, { useMemo } from "react";

import { Customer } from "../../types/NPC";
import { Property } from "../../types/property";
import { CocaineMix, ComputedCocaineMix } from "../../types/variety";

import { ADDITIVES } from "../../helpers/additives";
import ComputedCocaineMixesContext from "../ComputeCocaineMixesContext/ComputeCocaineMixesContext";
import ComputedCocaineMixesContextProvider from "../ComputeCocaineMixesContext/ComputedCocaineMixesContextProvider";
import Modal from "../Modal";
import styles from "./BestCocaineMixes.module.css";

type BestCocaineMixesProps = {
    cocaineMixes: CocaineMix[];
    properties: Property[];
    customers: Customer[];
};

const propertiesOrder = [
    "motelroom",
    'sweatshop'
]

const BestMethMixes = ({ cocaineMixes, properties, customers }: BestCocaineMixesProps) => {
    const [selectedPropertyId, setSelectedPropertyId] = React.useState('');
    
    const sortedProperties = [...properties].sort((a, b) => {
        const indexA = propertiesOrder.indexOf(a.id);
        const indexB = propertiesOrder.indexOf(b.id);
        return indexB - indexA; // Sort based on the order in the array
    });

    const selectedProperty = selectedPropertyId ? properties.find((property) => property.id === selectedPropertyId) : sortedProperties[0];

    return (
        <div>
            <h2>Best cocaine mixes</h2>
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
                    <ComputedCocaineMixesContextProvider property={selectedProperty} customers={customers} cocaineMixes={cocaineMixes}>
                        <PropertyResults />
                    </ComputedCocaineMixesContextProvider>
                </div>
            )}
        </div>
    )
}

const PropertyResults = () => {
    const { isSuggested, potsUsed, mixingMachineUsed, labOvensUsed, cauldronsUsed } = React.useContext(ComputedCocaineMixesContext);

    if (isSuggested) {
        return (
            <>

            {/* <div className={styles.emptyStateContainer}>
                <div className={styles.emptyState}> */}
                    You do not have any pot to grow weed on this property.<br/>This is a suggestion assuming you have {potsUsed} pots, {cauldronsUsed} cauldrons, {labOvensUsed} lab ovens and {mixingMachineUsed} mixing machine.<br /><br />
                {/* </div> */}
                <TopCocaineBySortType title={"Profit per day"} sortBy="profitPerDay" />
            {/* </div> */}
            </>
        )
    }

    return (
        <>
            Note that the profit per day is an estimate based on the number of pots, cauldrons, lab ovens, mixing machines and customers you have and with an optimized production (no halts).<br /><br />
            <div className={styles.topVarietiesTablesContainer}>
                <TopCocaineBySortType title={"Profit per unit"} sortBy="profitPerUnit" />
                <TopCocaineBySortType title={"Profit per day"} sortBy="profitPerDay"/>
            </div>
        </>
    )
}

type TopCocaineMixesBySortTypeProps = {
    title: string;
    sortBy: Exclude<keyof ComputedCocaineMix, 'mixSteps'>;
};

const TopCocaineBySortType = ({ title, sortBy }: TopCocaineMixesBySortTypeProps) => {
    const [selectedMethMix, setSelectedMethMix] = React.useState<ComputedCocaineMix | null>(null);
    const { cocaineMixes, potsUsed, mixingMachineUsed, labOvensUsed, cauldronsUsed, setPotsToUse, setCauldronsToUse, setLabOvensToUse, setMixingMachinesToUse } = React.useContext(ComputedCocaineMixesContext);

    const sortedMixes = useMemo(
        () => {
            return [...cocaineMixes].sort((a, b) => {
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
        [sortBy, cocaineMixes]
    );

    const topThreeCocaineMixes = useMemo(() => sortedMixes.slice(0, 3), [sortedMixes]);

    return (
        <>
        <div className={styles.topVarietiesContainer}>
            <span className={styles.label}>{title}</span>
            {sortBy === "profitPerDay" && (
                <div className={styles.info}>
                    <div className={styles.inlineInput}>
                        <span className={styles.label}>Pots</span>
                        <input
                            type="number"
                            value={potsUsed}
                            onChange={(e) => setPotsToUse(Number(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inlineInput}>
                        <span className={styles.label}>Cauldrons</span>
                        <input
                            type="number"
                            value={cauldronsUsed}
                            onChange={(e) => setCauldronsToUse(Number(e.target.value))}
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
            <div className={styles.cocaineMixesTable}>
                {topThreeCocaineMixes.map((cocaineMix, index) => (
                    <div key={cocaineMix.name} className={styles.varietyRow} onClick={() => setSelectedMethMix(cocaineMix)}>
                        <span className={styles.varietyName}>{cocaineMix.name} ({Math.floor(cocaineMix.productionPerDay)})</span>
                        <div className={styles.varietyInfo}>
                            <span className={styles.varietyValue}>${typeof cocaineMix[sortBy] === 'number' ? cocaineMix[sortBy].toFixed(2) : cocaineMix[sortBy]}</span>
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
                <p><strong>Price per unit:</strong> {selectedMethMix?.price}</p>
                <p><strong>Ingredient cost per batch:</strong> ${(selectedMethMix?.ingredientCost || 0) * 8}</p>
                <p><strong>Profit per unit:</strong> ${selectedMethMix?.profitPerUnit}</p>
                <p><strong>Profit per batch:</strong> ${selectedMethMix?.profitPerBatch}</p>
                <p><strong>Profit per day:</strong> ${selectedMethMix?.profitPerDay}</p>
                <p><strong>Production per day:</strong> {selectedMethMix?.productionPerDay}</p>
                <p><strong>Time per batch:</strong> {parseInt(`${selectedMethMix?.timePerBatch}`)}h{Math.round(((selectedMethMix?.timePerBatch || 0) % 1) * 60)}m</p>
                <p><strong>Mixing time per batch:</strong> {parseInt(`${selectedMethMix?.mixTime}`)}h{Math.round(((selectedMethMix?.mixTime || 0) % 1) * 60)}m</p>
                <div className={styles.varietyMixSteps}>
                    <h4>Mix Steps</h4>
                    <ul>
                        {([...selectedMethMix?.mixSteps || []])?.reverse().map((step, index) => (
                            <li key={index}>{cocaineMixes.find((v) => v.id === step.product)?.name} + {ADDITIVES[step.mixer].name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Modal>
    </>
    );
}

export default BestMethMixes;
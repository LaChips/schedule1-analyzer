import React, { useMemo } from "react";

import { Customer } from "../../types/NPC";
import { Property } from "../../types/property";
import { ComputedVariety, Variety } from "../../types/variety";
import { ComputedVarietiesContext, ComputedVarietiesProvider } from "../ComputedVarietiesContext";
import Modal from "../Modal";
import styles from "./BestVarieties.module.css";

type BestVarietiesProps = {
    varieties: Variety[];
    properties: Property[];
    customers: Customer[];
};

const propertiesOrder = [
    "motelroom",
    'sweatshop'
]

const BestVarieties = ({ varieties, properties, customers }: BestVarietiesProps) => {
    const [selectedPropertyId, setSelectedPropertyId] = React.useState('');
    
    const sortedProperties = [...properties].sort((a, b) => {
        const indexA = propertiesOrder.indexOf(a.id);
        const indexB = propertiesOrder.indexOf(b.id);
        return indexB - indexA; // Sort based on the order in the array
    });

    const selectedProperty = selectedPropertyId ? properties.find((property) => property.id === selectedPropertyId) : sortedProperties[0];

    return (
        <div>
            <h2>Best weed varieties</h2>
            <div className={styles.propertyRow}>
                {sortedProperties.map((property) => (
                    <div key={property.id} className={styles.propertyOption}>
                        <button className={`${styles.property} ${selectedProperty?.id === property.id ? styles.selected : ''}`} onClick={() => setSelectedPropertyId(property.id)}>
                            {property.name}
                        </button>
                    </div>
                ))}
            </div>
            {selectedProperty && (
                <div className={styles.bestVarietiesContainer}>
                    <ComputedVarietiesProvider property={selectedProperty} customers={customers} varieties={varieties}>
                        <PropertyResults />
                    </ComputedVarietiesProvider>
                </div>
            )}
        </div>
    )
}

const PropertyResults = () => {
    const { isSuggested, mixingMachineUsed, potsUsed } = React.useContext(ComputedVarietiesContext);

    if (isSuggested) {
        return (
            <div className={styles.emptyStateContainer}>
                <div className={styles.emptyState}>
                    You do not have any pot to grow weed on this property.<br/>This is a suggestion assuming you have {potsUsed} growing pots and {mixingMachineUsed} mixing machine.
                </div>
                <TopVarietiesBySortType title={"Profit per day"} sortBy="profitPerDay" />
            </div>
        )
    }

    return (
        <>
            Note that the profit per day is an estimate based on the number of pots / growing tents, mixing machines and customers you have and with an optimized production (no halts).<br/><br />
            <div className={styles.topVarietiesTablesContainer}>
                <TopVarietiesBySortType title={"Profit per bud"} sortBy="profitPerBud" />
                <TopVarietiesBySortType title={"Profit per day"} sortBy="profitPerDay"/>
            </div>
        </>
    )
}

type TopVarietiesBySortTypeProps = {
    title: string;
    sortBy: Exclude<keyof ComputedVariety, 'mixSteps'>;
};

const TopVarietiesBySortType = ({ title, sortBy }: TopVarietiesBySortTypeProps) => {
    const [selectedVariety, setSelectedVariety] = React.useState<ComputedVariety | null>(null);
    const { varieties, potsUsed, mixingMachineUsed, setPotsToUse, setMixingMachinesToUse } = React.useContext(ComputedVarietiesContext);

    const sortedVarieties = useMemo(
        () => {
            return [...varieties].sort((a, b) => {
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
        [sortBy, varieties]
    );

    const topThreeVarieties = useMemo(() => sortedVarieties.slice(0, 3), [sortedVarieties]);

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
                        {' - '}
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
                <div className={styles.varietiesTable}>
                    {topThreeVarieties.map((variety, index) => (
                        <div key={variety.name} className={styles.varietyRow} onClick={() => setSelectedVariety(variety)}>
                            <span className={styles.varietyName}>{variety.name} ({Math.floor(variety.productionPerDay)})</span>
                            <div className={styles.varietyInfo}>
                                <span className={styles.varietyValue}>${variety[sortBy]}</span>
                                {index === 0 && <span className={styles.varietyRank}>🥇</span>}
                                {index === 1 && <span className={styles.varietyRank}>🥈</span>}
                                {index === 2 && <span className={styles.varietyRank}>🥉</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal
                isOpen={!!selectedVariety}
                onClose={() => setSelectedVariety(null)}
                title={selectedVariety?.name || ''}
                className={styles.modal}
                contentClassName={styles.modalContent}
                showConfirmButton={false}
            >
                <div className={styles.varietyDetails}>
                    <h3>Details</h3>
                    <p><strong>Price per bud:</strong> {selectedVariety?.budPrice}</p>
                    <p><strong>Ingredient cost per batch:</strong> ${(selectedVariety?.ingredientCost || 0) * 8}</p>
                    <p><strong>Profit per bud:</strong> ${selectedVariety?.profitPerBud}</p>
                    <p><strong>Profit per batch:</strong> ${selectedVariety?.profitPerBatch}</p>
                    <p><strong>Profit per day:</strong> ${selectedVariety?.profitPerDay}</p>
                    <p><strong>Production per day:</strong> {selectedVariety?.productionPerDay}</p>
                    <p><strong>Time per batch:</strong> {parseInt(`${selectedVariety?.timePerBatch}`)}h{Math.round(((selectedVariety?.timePerBatch || 0) % 1) * 60)}m</p>
                    <p><strong>Mixing time per batch:</strong> {parseInt(`${selectedVariety?.mixTime}`)}h{Math.round(((selectedVariety?.mixTime || 0) % 1) * 60)}m</p>
                    <div className={styles.varietyMixSteps}>
                        <h4>Mix Steps</h4>
                        <ul>
                            {([...selectedVariety?.mixSteps || []])?.reverse().map((step, index) => (
                                <li key={index}>{varieties.find((v) => v.id === step.product)?.name} + {step.mixer}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default BestVarieties;
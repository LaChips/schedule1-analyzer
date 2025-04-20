
import React, { useMemo } from "react";
import { ComputedDealer, Customer, Dealer } from "../../types/NPC";

import CheckIcon from "../../assets/icons/Check";
import CustomerIcon from "../../assets/icons/Customer";
import SwapIcon from "../../assets/icons/Swap";
import { LOCATION_BY_ID, NPC_BY_DEALER_ID } from "../../types/location";
import Modal from "../Modal";
import styles from "./DealersList.module.css";

type DealersListProps = {
    dealers: Dealer[];
    allCustomers: Customer[];
};

const Dealerslist = ({ dealers, allCustomers }: DealersListProps) => {
    const [selectedDealerId, setSelectedDealerId] = React.useState<string | null>(null);

    const computedDealers: ComputedDealer[] = useMemo(() => {
        return dealers.map(dealer => {
            const idealCustomersForDealer = NPC_BY_DEALER_ID[dealer.id];
            const dealerCustomers = dealer.customers.map(customerId => {
                const customer = allCustomers.find(c => c.id === customerId);
                console.log("customer", customer);
                console.log("customerId", customerId);
                return {
                    id: customer?.id || "",
                    name: customer?.name || "",
                    isCorrectlyAssigned: idealCustomersForDealer.includes(customerId),
                };
            })
            const isOptimized = dealerCustomers.every(customer => customer.isCorrectlyAssigned) && dealerCustomers.length === 8;
            const wrongCustomers = dealerCustomers.filter(customer => !customer.isCorrectlyAssigned);
            // replace incorrectly assigned customers with the correct ones
            const absentCustomersFromDealerOptimalList = idealCustomersForDealer.filter(customerId => !dealerCustomers.find(c => c.id === customerId));
            
            const suggestedCustomers = wrongCustomers.map((wrongCustomer, index) => {
                const correctCustomer = absentCustomersFromDealerOptimalList[index];
                const customer = allCustomers.find(c => c.id === correctCustomer);
                return {
                    wrongCustomerId: wrongCustomer.id,
                    id: customer?.id || "",
                    name: customer?.name || "",
                };
            });
            return {
                ...dealer,
                isOptimized,
                ...(!isOptimized && {
                    suggestedCustomers,
                }),
                customers: dealerCustomers,
            };
        });
    }, [dealers, allCustomers]);

    const selectedDealer = useMemo(() => {
        return computedDealers.find(dealer => dealer.id === selectedDealerId);
    }, [selectedDealerId, computedDealers]);

    return (
        <div>
            <h2>Dealers</h2>
            <div className={styles.dealersList}>
                {computedDealers.map(dealer => (
                    <div className={styles.dealerCard} key={dealer.id}>
                        <span className={styles.dealerName}>{dealer.name}</span>
                        <span className={styles.location}>{LOCATION_BY_ID[dealer.locationId]}</span>
                        <button
                            className={styles.gameDataButton}
                            onClick={() => setSelectedDealerId(dealer.id)}
                        >
                            See dealer info
                        </button>
                    </div>
                ))}
            </div>
            <Modal
                onClose={() => setSelectedDealerId(null)}
                title="Dealer Info"
                isOpen={!!selectedDealerId}
                showConfirmButton={false}
                contentClassName={styles.dealerInfoContainer}
                className={styles.dealerInfoModal}
            >
                {selectedDealer && (
                    <>
                        <span className={styles.dealerName}>{selectedDealer.name}</span>
                        <span>{LOCATION_BY_ID[selectedDealer.locationId]}</span>
                        {!selectedDealer.isOptimized && (
                            <p className={styles.warning}>This dealer is not optimized! Consider swapping some customers according to the following list</p>
                        )}
                        <div className={styles.customersList}>
                            {selectedDealer.customers.map(customer => (
                                <div className={styles.customerCard} key={customer.id}>
                                    <div className={styles.currentCustomer}>
                                        <div className={styles.avatarContainer}>
                                            <CustomerIcon className={styles.customerAvatar} />
                                        </div>
                                        <div className={styles.customerName}>{customer.name}</div>
                                        {customer.isCorrectlyAssigned && (
                                            <div className={styles.correctlyAssignedAvatar}>
                                                <CheckIcon />
                                            </div>
                                        )}
                                    </div>
                                    {!customer.isCorrectlyAssigned && (
                                        <>
                                            <div className={styles.swapIconContainer}>
                                                <SwapIcon />
                                            </div>
                                            <div className={styles.suggestedCustomerContainer}>
                                                
                                                <CustomerPill customer={(selectedDealer.suggestedCustomers || []).find(c => c.wrongCustomerId === customer.id)} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
};

const CustomerPill = ({ customer }: { customer?: { id: string, name: string } }) => {
    return (
        <div className={`${styles.suggestedCustomer} ${!customer?.id ? styles.locked : ''}`}>
            <div className={styles.avatarContainer}>
                <CustomerIcon className={styles.customerAvatar} />
            </div>
            <div className={styles.customerName}>{customer?.name || "Locked"}</div>
        </div>
    )
}

export default Dealerslist;
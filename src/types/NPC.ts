import { Location } from "./location";

export type Supplier = {
    type: "supplier";
    id: string;
    name: string;
    debt: number;
    unlocked: boolean;
}

export type Dealer = {
    type: "dealer";
    id: string;
    name: string;
    customers: string[];
    recruited: boolean;
    locationId: Location['id'];
}

export type ComputedDealer = {
    type: "dealer";
    id: string;
    name: string;
    isOptimized: boolean;
    customers: {
        id: string;
        name: string;
        isCorrectlyAssigned: boolean;
    }[];
    suggestedCustomers?: {
        wrongCustomerId: string;
        id: string;
        name: string;
    }[];
    recruited: boolean;
    locationId: Location['id'];
}

export type Customer = {
    type: "customer";
    id: string;
    name: string;
    productAffinities: number[];
    averageOrderQuantity: number;
    isClient: boolean;
    products: {id: string, amount: number}[];
}
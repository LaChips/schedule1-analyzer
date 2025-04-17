
export type EmployeeType = 'Chemist' | 'Packager' | 'Botanist' | 'Cleaner';

export type Employee = {
    name: string;
    id: string;
    type: EmployeeType;
    propertyId: string;
    salary: number;
}

export type PropertyObject = {
    id: string;
    name: string;
    amount: number;
    propertyId: string;
}

export type Property = {
    id: string;
    name: string;
    employees: Employee[];
    objects: PropertyObject[];
}
import { SaveVariables } from "../types/game";
import { LOCATION_BY_DEALER_ID } from "../types/location";
import { Customer, Dealer, Supplier } from "../types/NPC";
import { Employee, EmployeeType, Property, PropertyObject } from "../types/property";
import { CocaineMix, MethType, Product, RawVariety, Variety } from "../types/variety";
import { ADDITIVES } from "./additives";
import { baseCocaineMixes, baseMethTypes, baseVarieties } from "./BaseVarieties";
import getArchiveContent from "./unzipArchive";

type MixRecipe = {
    product: string;
    mixer: string;
    output?: string;
}

type ProductFileContent = {
    Name: string;
    ID: string;
    DrugType: number;
    Properties: string[];
    DataType: string;
    GameVersion: string;
}

const getTypeProductsMap = async (files: {name: string, content: string}[], type: number): Promise<Record<string, ProductFileContent>> => {
    const productMap: Record<string, ProductFileContent> = {};
    for (const file of files) {
        if (!file.name.endsWith(".json")) continue;
        const parsedContent = JSON.parse(file.content)
        const { ID, DrugType } = parsedContent;
        if (DrugType !== type) continue;
        productMap[ID] = parsedContent;
    }
    return productMap;
}

const convertToVariety = (product: RawVariety, products: Record<string, ProductFileContent>, mixRecipes: Record<string, MixRecipe>, type: number): Product => {
    const { name, id } = product;
    const recipeChain = getRecipeChain(products[id], mixRecipes, products);
    const ingredientCost = recipeChain.reduce((acc, recipe) => {
        const additive = recipe.mixer;
        const additivePrice = ADDITIVES[additive]?.price || 0;
        return acc + additivePrice;
    }, 0);
    const baseProductId = recipeChain.length > 0 ? recipeChain[recipeChain.length - 1].product : id;
    const baseProduct = type === 0 ? baseVarieties[baseProductId] : type === 1 ? baseMethTypes[baseProductId] : baseCocaineMixes[baseProductId];
    console.log({name, id})
    return {
        name,
        id,
        base: baseProduct.name,
        ...type ===  0 ? { budPrice: product.sellPrice } : { crystalPrice: product.sellPrice },
        mixSteps: recipeChain,
        ingredientCost,
        ...type === 0 && {seedCost: (baseProduct as Variety).seedCost},
    };
}

const getRecipeChain = (product: ProductFileContent, mixRecipes: Record<string, MixRecipe>, products: Record<string, ProductFileContent>): MixRecipe[] => {
    if (!product) return [];
    const { ID } = product;
    const mixRecipe = mixRecipes[ID];
    if (!mixRecipe) return [];
    const { product: parentProductId, mixer } = mixRecipe;
    if (baseVarieties[parentProductId] || baseMethTypes[parentProductId] || baseCocaineMixes[parentProductId]) {
        return [
            {
                product: parentProductId,
                mixer,
            },
        ];
    }
    const parentProduct = products[parentProductId] || product;
    if (!parentProduct || parentProductId === product.ID) return [];
    const recipeChain: MixRecipe[] = getRecipeChain(parentProduct, mixRecipes, products);
    return [
        {
            product: parentProductId,
            mixer,
        },
        ...recipeChain,
    ];
}

export const parseProductVarieties = async (files: {name: string, content: string}[], type: number): Promise<{rawVarieties: RawVariety[], varieties: Product[]}> => {
    const allProducts = [];
    const mixRecipes: Record<string, MixRecipe> = {};
    const productPrices: Record<string, number> = {};
    const individualProductFiles = files.slice(0, files.length - 1);
    const productsFile = files[files.length - 1];
    const varietyMap = await getTypeProductsMap(individualProductFiles, type);
    const parsedContent = JSON.parse(await productsFile.content);
    for (const mixRecipe of parsedContent.MixRecipes) {
        const { Product, Mixer, Output } = mixRecipe;
        const actualMixer = ADDITIVES[Mixer] ? Mixer : Product;
        const actualProduct = actualMixer === Mixer ? Product : Mixer;
        if (actualProduct === Output) continue;
        mixRecipes[Output] = {product: actualProduct, mixer: actualMixer, output: Output};
    }
    for (const productPrice of parsedContent.ProductPrices) {
        const { String: product, Int: price } = productPrice;
        const baseProducts = type === 0 ? baseVarieties : type === 1 ? baseMethTypes : baseCocaineMixes;
        if (baseProducts[product]) {
            allProducts.push({
                name: baseVarieties[product]?.name || baseMethTypes[product]?.name || baseCocaineMixes[product]?.name || product,
                id: product,
                type,
                properties: [],
                dataType: "BaseProduct",
                gameVersion: "BaseGame",
                sellPrice: price,
            });
        }
        productPrices[product] = price;
    }
    for (const discoveredProduct of parsedContent.DiscoveredProducts) {
        const productData = varietyMap[discoveredProduct];
        if (!productData) continue;
        const { Name, ID, DrugType, Properties, DataType, GameVersion } = productData;
        allProducts.push({
            name: Name,
            id: ID,
            type: DrugType,
            properties: Properties,
            dataType: DataType,
            gameVersion: GameVersion,
            recipe: mixRecipes[ID],
            sellPrice: productPrices[ID],
        });
    }
    return {
        rawVarieties: allProducts,
        varieties: allProducts.map((rawVariety) => convertToVariety(rawVariety, varietyMap, mixRecipes, type)),
    };
}

export const GAME_OBJECTS: Record<string, string> = {
    bed: "Bed",
    chemistrystation: "Chemistry Station",
    displaycabinet: "Display Cabinet",
    dryingrack: "Drying Rack",
    fullspectrumgrowlight: "Full Spectrum Grow Light",
    growtent: "Grow Tent",
    laboven: "Lab Oven",
    largestoragerack: "Large Storage Rack",
    mediumstoragerack: "Medium Storage Rack",
    mixingstation: "Mixing Station",
    moisturepreservingpot: "Moisture Preserving Pot",
    packagingstation: "Packaging Station",
    smallstoragerack: "Small Storage Rack",
    suspensionrack: "Suspension Rack",
    trashcan: "Trash Can",
    TV: "TV",
    cauldron: "Cauldron",
    brickpress: "Brick Press",
    ledgrowlight: "LED Grow Light",
    plasticpot: "Plastic Pot",
}

export const WEED_GROWING_OBJECTS = [
    'growtent',
    'moisturepreservingpot',
    'plasticpot'
];

const EMPLOYEE_TYPES: Record<string, EmployeeType> = {
    ChemistData: "Chemist",
    PackagerData: "Packager",
    BotanistData: "Botanist",
    CleanerData: "Cleaner",
}

const SALARY_FROM_EMPLOYEE_TYPE: Record<EmployeeType, number> = {
    Chemist: 300,
    Packager: 200,
    Botanist: 200,
    Cleaner: 100,
}

const PROPERTIES_BY_NAME : Record<string, string> = {
    Barn: "barn",
    Bungalow: "bungalow",
    "Motel Room": "motelroom",
    Sweatshop: "sweatshop",
}

const parseProperties = async (files: {name: string, content: string}[]): Promise<Property[]> => {
    const allProperties: Property[] = [];
    const propertyMap: Record<string, Property> = {};
    const objectMap: Record<string, PropertyObject> = {};
    const employeeMap: Record<string, Employee> = {};
    for (const file of files) {
        if (file.name.endsWith("Property.json")) {
            const locationName = file.name.split('/')[2];
            const parsedContent = JSON.parse(file.content);
            const { PropertyCode } = parsedContent;
            if (!propertyMap[PropertyCode]) {
                propertyMap[PropertyCode] = {
                    name: locationName,
                    id: PropertyCode,
                    employees: [],
                    objects: [],
                };
            }
        } else if (file.name.endsWith("NPC.json")) {
            const parsedContent = JSON.parse(file.content);
            const { ID, AssignedProperty, DataType } = parsedContent;
            const employeeName = file.name.split('/')[4];
            if (!employeeMap[employeeName]) {
                employeeMap[employeeName] = {
                    name: employeeName,
                    id: ID,
                    type: EMPLOYEE_TYPES[DataType],
                    propertyId: AssignedProperty,
                    salary: SALARY_FROM_EMPLOYEE_TYPE[EMPLOYEE_TYPES[DataType]],
                };
            }
        } else if (file.name.endsWith("Data.json")) {
            const propertyName = file.name.split('/')[2];
            const propertyId = PROPERTIES_BY_NAME[propertyName];
            const parsedContent = JSON.parse(file.content);
            const { ItemString } = parsedContent;
            const embeddedData = JSON.parse(ItemString);
            const { ID } = embeddedData;

            const name = GAME_OBJECTS[ID] || ID;
            objectMap[`${propertyId}-${ID}`] = {
                name,
                id: ID,
                amount: objectMap[`${propertyId}-${ID}`]?.amount ? objectMap[`${propertyId}-${ID}`].amount + 1 : 1,
                propertyId
            }
        }
        
    }
    for (const propertyCode in propertyMap) {
        const property = propertyMap[propertyCode];
        const { name, id } = property;
        const employees = Object.values(employeeMap).filter((employee) => employee.propertyId === id);
        const objects = Object.values(objectMap).filter((object) => object.propertyId === id);
        allProperties.push({
            name,
            id,
            employees,
            objects,
        });
    }
    return allProperties;
}

type NPCSupplier = {
    DataType: "SupplierData";
    ID: string;
    debt: number;
}

type NPCDealer = {
    DataType: "DealerData";
    ID: string;
    Recruited: boolean;
    AssignedCustomerIDs: string[];
}

type NPCCustomer = {
    DataType: "NPCData";
    ID: string;
    ProductAffinities: number[];
    isClient: boolean;
    OfferedDeals: number;
    CompletedDeals: number;
    IsContractOffered: boolean;
    HasBeenRecommended: boolean;
}

type NPCFileContent = NPCSupplier | NPCCustomer | NPCDealer;

type NPC = Supplier | Customer | Dealer;

const parseNPCFile = (parsedContent: NPCFileContent, npcName: string): NPC | null => {
    const { DataType, ID } = parsedContent;
    if (DataType === "SupplierData") {
        return {
            type: "supplier",
            id: ID,
            name: npcName,
            debt: 0,
            unlocked: false,
        };
    } else if (DataType === "NPCData") {
        return {
            type: "customer",
            id: ID,
            name: npcName,
            productAffinities: [],
            averageOrderQuantity: 0,
            products: [],
            isClient: parsedContent.IsContractOffered || parsedContent.HasBeenRecommended || parsedContent.CompletedDeals > 0 || parsedContent.OfferedDeals > 0,
        };
    } else if (DataType === "DealerData") {
        return {
            type: "dealer",
            id: ID,
            name: npcName,
            customers: parsedContent.AssignedCustomerIDs,
            recruited: parsedContent.Recruited,
            locationId: LOCATION_BY_DEALER_ID[ID],
        };
    }
    return null;
}

type CustomerData = {
    productAffinities: number[];
    products: {id: string, amount: number}[];
    averageOrderQuantity: number;
    isClient: boolean;
}

const parseCustomerDataFile = async (parsedContent: NPCCustomer): Promise<Pick<CustomerData, 'productAffinities'>> => {
    const { ProductAffinities } = parsedContent;
    return {
        productAffinities: ProductAffinities,
    };
}

type MessageConversation = {
    DataType: "MSGConversationData";
    ID: string;
    MessageHistory: {
        Sender: number;
        MessageID: number;
        Text: string;
        EndOfChain: boolean;
    }[];
};

type CustomerOrderAverage = {
    products: {
        id: string;
        amount: number;
    }[];
    averageOrderQuantity: number;
}

const parseMessageConversationFile = async (parsedContent: MessageConversation): Promise<CustomerOrderAverage> => {
    const { MessageHistory } = parsedContent;
    const messagesFromCustomer = MessageHistory.filter((message) => message.Sender === 1);
    const messageWithOrder = messagesFromCustomer.filter((message) => {
        const { Text } = message;
        const match = Text.match(/[0-9]x\s([A-Z][a-z]*)\s([A-Z][a-z]*)/gi);
        if (!match) return false;
        const [amount, product] = match[0].split("x ");
        const productId = product.replace(/ /g, "").toLowerCase();
        const quantity = parseInt(amount);
        return productId && !isNaN(quantity) && quantity > 0;
    });
    const ordersByProduct: Record<string, number> = {};
    const productsAndQuantities = messageWithOrder.reduce((acc, message) => {
        const { Text } = message;
        const match = Text.match(/[0-9]x\s([A-Z][a-z]*)\s([A-Z][a-z]*)/gi);
        if (!match) return acc;
        const [amount, product] = match[0].split("x ");
        const productId = product.replace(/ /g, "").toLowerCase();
        const quantity = parseInt(amount);
        ordersByProduct[productId] = (ordersByProduct[productId] || 0) + 1;
        if (acc?.[productId]) {
            acc[productId] += quantity;
        } else {
            acc[productId] = quantity;
        }
        return acc;
    }, {} as Record<string, number>);
    const products = Object.entries(productsAndQuantities).map(([id, amount]) => {
        return { id, amount: amount / ordersByProduct[id] };
    });
    return {
        products,
        averageOrderQuantity: Object.values(ordersByProduct).reduce((acc, quantity) => acc + quantity, 0) / Object.keys(ordersByProduct).length,
    };
}

const parseCustomers = async (files: {name: string, content: string}[]): Promise<{dealers: NPC[], customers: NPC[], suppliers: NPC[]}> => {
    const customerMap: Record<string, NPC> = {};
    const suppliersMap: Record<string, NPC> = {};
    const dealersMap: Record<string, NPC> = {};
    for (const file of files) {
        if (!file.name.endsWith(".json")) continue;
        const parsedContent = JSON.parse(file.content);
        const NPCName = file.name.split('/')[2];
        if (file.name.endsWith("NPC.json")) {
            const NPC = await parseNPCFile(parsedContent, NPCName);
            if (!NPC) continue;
            if (NPC.type === "supplier") {
                suppliersMap[NPC.name] = NPC;
            } else if (NPC.type === "dealer") {
                dealersMap[NPC.name] = NPC;
            } else if (NPC.type === "customer") {
                customerMap[NPC.name] = NPC;
            }
        }
    }
    for (const file of files) {
        if (!file.name.endsWith(".json") || file.name === "NPC.json") continue;
        const parsedContent = JSON.parse(file.content);
        const NPCName = file.name.split('/')[2];
        if (file.name.endsWith("CustomerData.json")) {
            if (dealersMap[NPCName] || suppliersMap[NPCName] || !customerMap[NPCName]) continue;
            const customer = customerMap[NPCName];
            if (customer) {
                const customerData = await parseCustomerDataFile(parsedContent);
                if (customerData) {
                    customerMap[NPCName] = {
                        ...customer,
                        ...customerData,
                    };
                }
            }
        }
        if (file.name.endsWith("MessageConversation.json")) {
            if (dealersMap[NPCName] || suppliersMap[NPCName] || !customerMap[NPCName]) continue;
            const customer = customerMap[NPCName];
            if (customer) {
                const customerData = await parseMessageConversationFile(parsedContent);
                if (customerData) {
                    customerMap[NPCName] = {
                        ...customer,
                        ...customerData,
                    };
                }
            }
        }
        if (file.name.endsWith("Relationship.json")) {
            if (!dealersMap[NPCName] && !customerMap[NPCName] && !suppliersMap[NPCName]) continue;
            const npc = customerMap[NPCName] || dealersMap[NPCName] || suppliersMap[NPCName];
            if (npc) {
                const { Unlocked } = parsedContent;
                if (npc.type === "customer") {
                    customerMap[NPCName] = {
                        ...npc,
                        isClient: Unlocked,
                    };
                } else if (npc.type === "dealer") {
                    dealersMap[NPCName] = {
                        ...npc,
                        recruited: Unlocked,
                    };
                } else if (npc.type === "supplier") {
                    suppliersMap[NPCName] = {
                        ...npc,
                        unlocked: Unlocked,
                    };
                }
            }
        }
    }
    return {
        dealers: Object.values(dealersMap) as Dealer[],
        customers: (Object.values(customerMap) as Customer[]).filter((customer => customer.isClient)),
        suppliers: Object.values(suppliersMap) as Supplier[],
    }
}

const parseSaveVariables = (files: {name: string, content: string}[]): SaveVariables => {
    const saveVariables: Record<string, string | number> = {};
    for (const file of files) {
        const parsedContent = JSON.parse(file.content);
        if (file.name.endsWith("Game.json")) {
            const { OrganisationName, Seed } = parsedContent;
            saveVariables.organisationName = OrganisationName;
            saveVariables.seed = Seed;
        } else if (file.name.endsWith("Metadata.json")) {
            const { CreationDate, LastPlayedDate } = parsedContent;
            saveVariables.creationDate = new Date(CreationDate.Year, CreationDate.Month - 1, CreationDate.Day, CreationDate.Hour, CreationDate.Minute, CreationDate.Second).toISOString();
            saveVariables.lastPlayedDate = new Date(LastPlayedDate.Year, LastPlayedDate.Month - 1, LastPlayedDate.Day, LastPlayedDate.Hour, LastPlayedDate.Minute, LastPlayedDate.Second).toISOString();
        } else if (file.name.endsWith("Money.json")) {
            const { OnlineBalance, Networth, LifetimeEarnings } = parsedContent;
            saveVariables.onlineBalance = OnlineBalance;
            saveVariables.netWorth = Networth;
            saveVariables.lifetimeEarnings = LifetimeEarnings;
        } else if (file.name.endsWith("Rank.json")) {
            const { Rank, Tier, XP, TotalXP } = parsedContent;
            saveVariables.rank = Rank;
            saveVariables.tier = Tier;
            saveVariables.xp = XP;
            saveVariables.totalXp = TotalXP;
        } else if (file.name.endsWith("Time.json")) {
            const { ElapsedDays, Playtime } = parsedContent;
            saveVariables.elapsedDays = ElapsedDays;
            saveVariables.playtime = Playtime;
        }
    }
    return {
        game: {
            elapsedDays: saveVariables.elapsedDays as number,
            creationDate: saveVariables.creationDate as string,
            lastPlayedDate: saveVariables.lastPlayedDate as string,
            seed: saveVariables.seed as number,
            organisationName: saveVariables.organisationName as string,
            playtime: saveVariables.playtime as number,
        },
        player: {
            rank: saveVariables.rank as number,
            tier: saveVariables.tier as number,
            xp: saveVariables.xp as number,
            totalXp: saveVariables.totalXp as number,
            onlineBalance: saveVariables.onlineBalance as number,
            netWorth: saveVariables.netWorth as number,
            lifetimeEarnings: saveVariables.lifetimeEarnings as number,
        },
    }
}

type ParsedSaveFile = {
    varieties: Variety[];
    methTypes: MethType[];
    cocaineMixes: CocaineMix[];
    npcs: {dealers: Dealer[], customers: Customer[], suppliers: Supplier[]};
    gameData: SaveVariables;
    properties: Property[];
} | null;

export const parseSaveFile = async (file: File): Promise<ParsedSaveFile> => {
    const unzipedArchive = await getArchiveContent(file);
    const archiveName = unzipedArchive[0].name?.split('/')?.[0];
    if (!archiveName) {
        console.error("Invalid archive name");
        return null;
    };
    const productsFiles = unzipedArchive.filter((file) => file.name.startsWith(`${archiveName}/Products/`));
    const propertiesFiles = unzipedArchive.filter((file) => file.name.startsWith(`${archiveName}/Properties/`));
    const customerFiles = unzipedArchive.filter((file) => file.name.startsWith(`${archiveName}/NPCs/`));
    const saveVariablesFiles = unzipedArchive.filter((file) => {
        const jsonFileName = file.name.slice(file.name.lastIndexOf('/'));
        if (!jsonFileName || jsonFileName === '/') return false;
        return file.name === `${archiveName}${jsonFileName}`;
    });
    if (!productsFiles || productsFiles.length === 0) {
        console.error("No products file found");
        return null;
    }
    return {
        varieties: (await parseProductVarieties(productsFiles, 0)).varieties as Variety[],
        methTypes: (await parseProductVarieties(productsFiles, 1)).varieties as MethType[],
        cocaineMixes: (await parseProductVarieties(productsFiles, 2)).varieties as CocaineMix[],
        npcs: (await parseCustomers(customerFiles)) as {dealers: Dealer[], customers: Customer[], suppliers: Supplier[]},
        properties: await parseProperties(propertiesFiles),
        gameData: parseSaveVariables(saveVariablesFiles),
    }
}
export interface OngParams {
    ngoId: string;
}

export interface ActionParams {
    actionId: string;
}

export interface DeleteParams {
    id: string;
}

export interface OngActionParams {
    ngoId: string;
    actionId: string;
}

export interface NgoExpensesGrafic {
    id: string;
    categorysExpenses: Record<string, number>[];
    actionId: string;
    ngoId: number;
    createdAt: string;
    updatedAt: string;
}
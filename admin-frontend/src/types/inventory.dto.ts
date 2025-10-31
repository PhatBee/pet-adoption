import { ProductQueryDto } from './next';

export enum InventorySortBy {
    NEWEST = 'createdAt',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    OLDEST = 'createdAt',
    MOST_STOCK = 'stock',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    LEAST_STOCK = 'stock',
    NAME = 'name',
}

export interface InventoryQueryDto extends ProductQueryDto {
    sortBy?: InventorySortBy;
    sortOrder?: 'asc' | 'desc';
}

export interface UpdateStockDto {
    quantity: number;
}
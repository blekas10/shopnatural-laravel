export interface BaseProduct {
    id: number;
    name: string;
    title: string | null;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    image: string;
    isOnSale: boolean;
    salePercentage: number | null;
}

export interface ProductListItem extends BaseProduct {
    brandId: number | null;
    brandName: string | null;
    categoryIds: number[];
}

export interface ProductVariant {
    id: number;
    sku: string;
    size: string; // Formatted as "500ml", "1000ml"
    price: number;
    compareAtPrice: number | null;
    stock: number;
    inStock: boolean;
    isDefault: boolean;
}

export interface ProductImage {
    id: number;
    url: string;
    altText: string | null;
    isPrimary: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

export interface Brand {
    id: number;
    name: string;
    productCount?: number;
}

export interface ProductDetail extends BaseProduct {
    sku: string;
    shortDescription: string | null;
    description: string;
    additionalInformation: string | null;
    ingredients: string;
    inStock: boolean;
    categories: Category[];
    images: ProductImage[];
    variants: ProductVariant[];
}

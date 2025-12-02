export interface BaseProduct {
    id: number;
    name: string;
    title: string | null;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
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
    image: string | null; // Variant-specific image
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
    children?: Brand[];
}

export interface ProductBrand {
    id: number;
    name: string;
    slug: string;
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
    // Brand data
    brand: ProductBrand | null;
    parentBrand: ProductBrand | null;
    // Language switching
    alternateSlug?: string;
    // SEO fields
    metaTitle: string;
    metaDescription: string | null;
    focusKeyphrase: string | null;
}

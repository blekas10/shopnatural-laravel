import { Head, Link } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ProductCard } from '@/components/product-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronDown, Filter, X, Search } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ProductListItem, Brand, Category } from '@/types/product';

interface ProductsIndexProps {
    allProducts: ProductListItem[];
    brands: Brand[];
    categories: Category[];
}

interface Filters {
    categoryIds: number[];
    brandIds: number[];
    priceRange: [number, number];
    sort: string;
    search: string;
}

export default function ProductsIndex({ allProducts, brands, categories }: ProductsIndexProps) {
    const { t, route } = useTranslation();

    // Calculate price range from products
    const priceExtent = useMemo(() => {
        if (allProducts.length === 0) return [0, 1000];
        const prices = allProducts.map(p => p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        return [min, max];
    }, [allProducts]);

    const [filters, setFilters] = useState<Filters>(() => {
        // Initialize filters from URL params
        const urlParams = new URLSearchParams(window.location.search);

        const categoryIds = urlParams.get('categories')?.split(',').map(Number).filter(n => !isNaN(n)) || [];
        const brandIds = urlParams.get('brands')?.split(',').map(Number).filter(n => !isNaN(n)) || [];
        const search = urlParams.get('search') || '';
        const sort = urlParams.get('sort') || 'featured';
        const minPrice = urlParams.get('minPrice');
        const maxPrice = urlParams.get('maxPrice');

        const priceRange: [number, number] = [
            minPrice ? parseFloat(minPrice) : priceExtent[0],
            maxPrice ? parseFloat(maxPrice) : priceExtent[1],
        ];

        return {
            categoryIds,
            brandIds,
            priceRange,
            sort,
            search,
        };
    });

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [expandedBrands, setExpandedBrands] = useState<number[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [visibleProductCount, setVisibleProductCount] = useState(20);

    // Update URL when filters change
    const updateURL = useCallback((newFilters: Filters) => {
        const params = new URLSearchParams();

        if (newFilters.categoryIds.length > 0) {
            params.set('categories', newFilters.categoryIds.join(','));
        }
        if (newFilters.brandIds.length > 0) {
            params.set('brands', newFilters.brandIds.join(','));
        }
        if (newFilters.search) {
            params.set('search', newFilters.search);
        }
        if (newFilters.sort !== 'featured') {
            params.set('sort', newFilters.sort);
        }
        if (newFilters.priceRange[0] !== priceExtent[0]) {
            params.set('minPrice', newFilters.priceRange[0].toString());
        }
        if (newFilters.priceRange[1] !== priceExtent[1]) {
            params.set('maxPrice', newFilters.priceRange[1].toString());
        }

        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : window.location.pathname;

        // Update URL without page reload
        window.history.replaceState({}, '', newUrl);
    }, [priceExtent]);

    // Update URL when filters change
    useEffect(() => {
        updateURL(filters);
    }, [filters, updateURL]);

    // Reset visible count when filters change - use key based on filter string
    const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate reset on filter change
        setVisibleProductCount(20);
    }, [filterKey]);


    // Helper to find a brand by ID in hierarchical structure
    const findBrandById = (brandId: number, brandList: Brand[] = brands): Brand | null => {
        for (const brand of brandList) {
            if (brand.id === brandId) return brand;
            if (brand.children) {
                const found = findBrandById(brandId, brand.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper to find a category by ID in hierarchical structure
    const findCategoryById = (categoryId: number, categoryList: Category[] = categories): Category | null => {
        for (const category of categoryList) {
            if (category.id === categoryId) return category;
            if (category.children) {
                const found = findCategoryById(categoryId, category.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Get all descendant category IDs (children and grandchildren)
    const getAllDescendantIds = useCallback((categoryId: number): number[] => {
        const result: number[] = [categoryId];

        const findDescendants = (cats: Category[]) => {
            for (const cat of cats) {
                if (cat.id === categoryId) {
                    // Add all children
                    cat.children?.forEach((child: Category) => {
                        result.push(child.id);
                        // Add all grandchildren
                        child.children?.forEach((grandchild: Category) => {
                            result.push(grandchild.id);
                        });
                    });
                    return;
                }
                // Recursively search in children
                if (cat.children?.length) {
                    findDescendants(cat.children);
                }
            }
        };

        findDescendants(categories);
        return result;
    }, [categories]);

    // Get all descendant brand IDs (children and grandchildren)
    const getAllBrandDescendantIds = useCallback((brandId: number): number[] => {
        const result: number[] = [brandId];

        const findDescendants = (brandList: Brand[]) => {
            for (const brand of brandList) {
                if (brand.id === brandId) {
                    // Add all children
                    brand.children?.forEach((child: Brand) => {
                        result.push(child.id);
                        // Add all grandchildren
                        child.children?.forEach((grandchild: Brand) => {
                            result.push(grandchild.id);
                        });
                    });
                    return;
                }
                // Recursively search in children
                if (brand.children?.length) {
                    findDescendants(brand.children);
                }
            }
        };

        findDescendants(brands);
        return result;
    }, [brands]);

    // Client-side filtering logic
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Filter by search (name or SKU - stored in slug or title)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(searchLower);
                const titleMatch = p.title?.toLowerCase().includes(searchLower);
                const slugMatch = p.slug.toLowerCase().includes(searchLower);
                return nameMatch || titleMatch || slugMatch;
            });
        }

        // Filter by categories (include children and grandchildren)
        // Use AND logic: product must match ALL selected category groups
        if (filters.categoryIds.length > 0) {
            filtered = filtered.filter(p => {
                // For each selected category, check if product is in that category or its descendants
                return filters.categoryIds.every(selectedCategoryId => {
                    const categoryIdsWithDescendants = getAllDescendantIds(selectedCategoryId);
                    return p.categoryIds.some(productCategoryId =>
                        categoryIdsWithDescendants.includes(productCategoryId)
                    );
                });
            });
        }

        // Filter by brands (include children and grandchildren)
        // Use AND logic: product must match ALL selected brand groups
        if (filters.brandIds.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.brandId) return false;
                // For each selected brand, check if product brand is in that brand or its descendants
                return filters.brandIds.every(selectedBrandId => {
                    const brandIdsWithDescendants = getAllBrandDescendantIds(selectedBrandId);
                    return brandIdsWithDescendants.includes(p.brandId);
                });
            });
        }

        // Filter by price range
        filtered = filtered.filter(p =>
            p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
        );

        // Sort
        switch (filters.sort) {
            case 'price_asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                // Keep original order (already sorted by newest in backend)
                break;
            default: // featured
                // Keep original order (already sorted by featured in backend)
                break;
        }

        return filtered;
    }, [allProducts, filters, getAllDescendantIds, getAllBrandDescendantIds]);

    // Get active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.categoryIds.length > 0) count += filters.categoryIds.length;
        if (filters.brandIds.length > 0) count += filters.brandIds.length;
        if (filters.priceRange[0] !== priceExtent[0] || filters.priceRange[1] !== priceExtent[1]) count += 1;
        if (filters.search) count += 1;
        return count;
    }, [filters, priceExtent]);

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            categoryIds: [],
            brandIds: [],
            priceRange: priceExtent as [number, number],
            sort: filters.sort,
            search: '',
        });
    };

    // Toggle category
    const toggleCategory = (categoryId: number) => {
        setFilters(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId],
        }));
    };

    // Toggle brand
    const toggleBrand = (brandId: number) => {
        setFilters(prev => ({
            ...prev,
            brandIds: prev.brandIds.includes(brandId)
                ? prev.brandIds.filter(id => id !== brandId)
                : [...prev.brandIds, brandId],
        }));
    };

    // Toggle brand expansion
    const toggleBrandExpansion = (brandId: number) => {
        setExpandedBrands(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        );
    };

    // Toggle category expansion
    const toggleCategoryExpansion = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Render category recursively with expand/collapse
    const renderCategory = (category: Category, level: number = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories.includes(category.id);
        const isChecked = filters.categoryIds.includes(category.id);

        return (
            <div key={category.id}>
                <div className={cn(
                    'flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors hover:bg-muted/50',
                    level === 1 && 'ml-6',
                    level === 2 && 'ml-12'
                )}>
                    {hasChildren ? (
                        <button
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="flex items-center justify-center w-5 h-5 hover:bg-muted rounded transition-colors flex-shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5 flex-shrink-0" />
                    )}

                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleCategory(category.id)}
                            className="border-2 data-[state=checked]:bg-gold data-[state=checked]:border-gold flex-shrink-0"
                        />
                        <span className={cn(
                            'text-sm transition-colors',
                            isChecked ? 'font-semibold text-gold' : 'text-foreground',
                            level === 0 ? 'font-semibold text-gold uppercase' : '',
                            level > 0 && !isChecked && 'text-muted-foreground',
                            'truncate'
                        )}>
                            {category.name}
                        </span>
                    </label>
                </div>

                {hasChildren && isExpanded && (
                    <div className="space-y-0.5">
                        {category.children!.map(child => renderCategory(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Sorted categories for filters
    const sortedCategories = useMemo(() => [...categories].sort((a, b) => {
        const aHasChildren = a.children && a.children.length > 0;
        const bHasChildren = b.children && b.children.length > 0;

        if (aHasChildren && !bHasChildren) return -1;
        if (!aHasChildren && bHasChildren) return 1;
        return 0;
    }), [categories]);

    // Render category filter UI
    const renderCategoryFilter = () => (
        <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                {t('products.categories', 'Categories')}
            </h3>
            <div className="space-y-0.5">
                {sortedCategories.map(category => renderCategory(category, 0))}
            </div>
        </div>
    );

    // Render brand recursively with expand/collapse
    const renderBrand = (brand: Brand, level: number = 0) => {
        const hasChildren = brand.children && brand.children.length > 0;
        const isExpanded = expandedBrands.includes(brand.id);
        const isChecked = filters.brandIds.includes(brand.id);

        return (
            <div key={brand.id}>
                <div className={cn(
                    'flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors hover:bg-muted/50',
                    level === 1 && 'ml-6',
                    level === 2 && 'ml-12'
                )}>
                    {hasChildren ? (
                        <button
                            onClick={() => toggleBrandExpansion(brand.id)}
                            className="flex items-center justify-center w-5 h-5 hover:bg-muted rounded transition-colors flex-shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5 flex-shrink-0" />
                    )}

                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleBrand(brand.id)}
                            className="border-2 data-[state=checked]:bg-gold data-[state=checked]:border-gold flex-shrink-0"
                        />
                        <span className={cn(
                            'text-sm transition-colors',
                            isChecked ? 'font-semibold text-gold' : 'text-foreground',
                            level === 0 ? 'font-semibold text-gold uppercase' : '',
                            level > 0 && !isChecked && 'text-muted-foreground',
                            'truncate'
                        )}>
                            {brand.name}
                        </span>
                    </label>
                </div>

                {hasChildren && isExpanded && (
                    <div className="space-y-0.5">
                        {brand.children!.map(child => renderBrand(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Sorted brands for filters
    const sortedBrands = useMemo(() => [...brands].sort((a, b) => {
        const aHasChildren = a.children && a.children.length > 0;
        const bHasChildren = b.children && b.children.length > 0;

        if (aHasChildren && !bHasChildren) return -1;
        if (!aHasChildren && bHasChildren) return 1;
        return 0;
    }), [brands]);

    // Render brand filter UI
    const renderBrandFilter = () => (
        <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                {t('products.brands', 'Brands')}
            </h3>
            <div className="space-y-0.5">
                {sortedBrands.map(brand => renderBrand(brand, 0))}
            </div>
        </div>
    );

    // Render price range filter UI
    const renderPriceRangeFilter = () => (
        <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wide text-gold">
                {t('products.price_range', 'Price Range')}
            </h3>
            <div className="space-y-6">
                <Slider
                    min={priceExtent[0]}
                    max={priceExtent[1]}
                    step={1}
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    className="w-full [&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold [&_[role=slider]]:size-5 [&>span]:bg-gold/20 [&>span>span]:bg-gold"
                />
                <div className="flex items-center justify-between gap-2">
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-2">
                        <span className="text-xs text-muted-foreground">Min</span>
                        <div className="font-bold text-foreground">€{filters.priceRange[0].toFixed(2)}</div>
                    </div>
                    <div className="text-muted-foreground">—</div>
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-2">
                        <span className="text-xs text-muted-foreground">Max</span>
                        <div className="font-bold text-foreground">€{filters.priceRange[1].toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title={t('products.title', 'Products')} />

            <div className="min-h-screen bg-background">
                <MainHeader />

                {/* Page Header */}
                <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <span className="text-foreground">{t('products.title', 'Products')}</span>
                        </div>
                        <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl">
                            {t('products.catalog', 'Product Catalog')}
                        </h1>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
                    <div className="flex gap-8">
                        {/* Desktop Sidebar Filters */}
                        <aside className="hidden w-80 flex-shrink-0 lg:block">
                            <div className="sidebar-filters sticky top-24 space-y-6 overflow-y-auto max-h-[calc(100vh-7rem)] pr-2">
                                {/* Search Input */}
                                <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                                        {t('products.search', 'Search')}
                                    </h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder={t('products.search_placeholder', 'Search products...')}
                                            value={filters.search}
                                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                            className="pl-10 pr-10"
                                        />
                                        {filters.search && (
                                            <button
                                                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {renderCategoryFilter()}
                                {renderBrandFilter()}
                                {renderPriceRangeFilter()}

                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full border-2 border-gold text-gold hover:bg-gold hover:text-white transition-all duration-300"
                                    >
                                        <X className="size-4 mr-2" />
                                        {t('products.clear_all_filters', 'Clear All Filters')} ({activeFilterCount})
                                    </Button>
                                )}
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Active Filter Pills */}
                            <div className="mb-6 space-y-4">
                                {activeFilterCount > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {filters.search && (
                                            <div className="flex items-center gap-2 rounded-full border-2 border-gold bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                                                <Search className="size-3.5" />
                                                "{filters.search}"
                                                <button onClick={() => setFilters(prev => ({ ...prev, search: '' }))} className="ml-1 rounded-full hover:bg-gold/20 p-0.5 transition-colors">
                                                    <X className="size-3.5 stroke-[2.5]" />
                                                </button>
                                            </div>
                                        )}
                                        {filters.categoryIds.map(catId => {
                                            const cat = findCategoryById(catId);
                                            return cat ? (
                                                <div key={catId} className="flex items-center gap-2 rounded-full border-2 border-gold bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                                                    {cat.name}
                                                    <button onClick={() => toggleCategory(catId)} className="ml-1 rounded-full hover:bg-gold/20 p-0.5 transition-colors">
                                                        <X className="size-3.5 stroke-[2.5]" />
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                        {filters.brandIds.map(brandId => {
                                            const brand = findBrandById(brandId);
                                            return brand ? (
                                                <div key={brandId} className="flex items-center gap-2 rounded-full border-2 border-gold bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                                                    {brand.name}
                                                    <button onClick={() => toggleBrand(brandId)} className="ml-1 rounded-full hover:bg-gold/20 p-0.5 transition-colors">
                                                        <X className="size-3.5 stroke-[2.5]" />
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                        {(filters.priceRange[0] !== priceExtent[0] || filters.priceRange[1] !== priceExtent[1]) && (
                                            <div className="flex items-center gap-2 rounded-full border-2 border-gold bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                                                €{filters.priceRange[0].toFixed(2)} - €{filters.priceRange[1].toFixed(2)}
                                                <button
                                                    onClick={() => setFilters(prev => ({ ...prev, priceRange: priceExtent as [number, number] }))}
                                                    className="ml-1 rounded-full hover:bg-gold/20 p-0.5 transition-colors"
                                                >
                                                    <X className="size-3.5 stroke-[2.5]" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sort and Results Count */}
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {t('products.showing', 'Showing')} {Math.min(visibleProductCount, filteredProducts.length)} {t('products.of', 'of')} {filteredProducts.length} {filteredProducts.length === 1 ? t('products.product', 'product') : t('products.products', 'products')}
                                </div>

                                <Select
                                    value={filters.sort}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={t('products.sort_by', 'Sort by')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">{t('products.sort.featured', 'Featured')}</SelectItem>
                                        <SelectItem value="newest">{t('products.sort.newest', 'Newest')}</SelectItem>
                                        <SelectItem value="price_asc">{t('products.sort.price_asc', 'Price: Low to High')}</SelectItem>
                                        <SelectItem value="price_desc">{t('products.sort.price_desc', 'Price: High to Low')}</SelectItem>
                                        <SelectItem value="name">{t('products.sort.name', 'Name')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Products Grid */}
                            {filteredProducts.length > 0 ? (
                                <>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                                        {filteredProducts.slice(0, visibleProductCount).map((product, index) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                href={route('products.show', { slug: product.slug })}
                                                index={index}
                                            />
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {filteredProducts.length > visibleProductCount && (
                                        <div className="mt-12 flex justify-center">
                                            <Button
                                                onClick={() => setVisibleProductCount(prev => prev + 20)}
                                                variant="outline"
                                                className="border-2 border-gold text-gold hover:bg-gold hover:text-white transition-all duration-300 px-8 py-6 text-base font-bold uppercase"
                                            >
                                                {t('products.load_more', 'Load More Products')}
                                                <span className="ml-2 text-sm">
                                                    ({visibleProductCount} / {filteredProducts.length})
                                                </span>
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="rounded-2xl border-2 border-dashed border-border p-12">
                                        <Filter className="size-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-bold uppercase tracking-wide text-foreground mb-2">
                                            {t('products.no_products_found', 'No Products Found')}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            {t('products.no_products_description', 'No products match your current filters. Try adjusting your selections.')}
                                        </p>
                                        <Button onClick={clearFilters} variant="outline">
                                            {t('products.clear_all_filters', 'Clear All Filters')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Button */}
                <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center lg:hidden">
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-gold bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground shadow-lg shadow-gold/50 transition-all duration-300 ease-in-out hover:bg-background hover:text-gold"
                    >
                        <Filter className="size-4" />
                        {t('products.filters', 'Filters')}
                        {activeFilterCount > 0 && (
                            <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile Filter Sheet */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                        <SheetHeader className="border-b border-border pb-4 mb-6">
                            <SheetTitle className="text-sm font-bold uppercase tracking-wide flex items-center justify-between">
                                {t('products.filters', 'Filters')}
                                
                            </SheetTitle>
                        </SheetHeader>

                        <div className="space-y-6 p-2 pb-24 ">
                            {/* Search Input */}
                            <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                                    {t('products.search', 'Search')}
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={t('products.search_placeholder', 'Search products...')}
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className="pl-10 pr-10"
                                    />
                                    {filters.search && (
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {renderCategoryFilter()}
                            {renderBrandFilter()}
                            {renderPriceRangeFilter()}
                        </div>

                        <SheetFooter className="fixed bottom-0 left-0 right-0 flex-row gap-2 border-t border-border bg-background p-4 shadow-lg">
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1 border-2 border-border text-sm font-bold uppercase"
                                >
                                    {t('products.clear_all', 'Clear All')}
                                </Button>
                            )}
                            <Button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="flex-1 border-2 border-gold bg-gold text-sm font-bold uppercase text-foreground transition-all duration-300 hover:bg-background hover:text-gold"
                            >
                                {t('products.show_products', 'Show {count} Products').replace('{count}', filteredProducts.length.toString())}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <Footer />
            </div>
        </>
    );
}

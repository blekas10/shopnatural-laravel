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
import { ChevronRight, Filter, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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

    const [filters, setFilters] = useState<Filters>({
        categoryIds: [],
        brandIds: [],
        priceRange: priceExtent as [number, number],
        sort: 'featured',
    });

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Read category from URL and pre-filter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            const categoryId = parseInt(categoryParam);
            if (!isNaN(categoryId)) {
                setFilters(prev => ({
                    ...prev,
                    categoryIds: [categoryId],
                }));
            }
        }
    }, []);

    // Flatten categories for easier rendering
    const flattenCategories = (cats: Category[]): Array<{ id: number; name: string; level: number }> => {
        const result: Array<{ id: number; name: string; level: number }> = [];

        cats.forEach(cat => {
            result.push({ id: cat.id, name: cat.name, level: 0 });
            cat.children?.forEach(child => {
                result.push({ id: child.id, name: child.name, level: 1 });
                child.children?.forEach(grandchild => {
                    result.push({ id: grandchild.id, name: grandchild.name, level: 2 });
                });
            });
        });

        return result;
    };

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

    // Get all descendant category IDs (children and grandchildren)
    const getAllDescendantIds = (categoryId: number): number[] => {
        const result: number[] = [categoryId];

        const findDescendants = (cats: any[]) => {
            for (const cat of cats) {
                if (cat.id === categoryId) {
                    // Add all children
                    cat.children?.forEach((child: any) => {
                        result.push(child.id);
                        // Add all grandchildren
                        child.children?.forEach((grandchild: any) => {
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
    };

    // Client-side filtering logic
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Filter by categories (include children and grandchildren)
        if (filters.categoryIds.length > 0) {
            // Get all category IDs including descendants
            const allCategoryIds = filters.categoryIds.flatMap(id => getAllDescendantIds(id));
            filtered = filtered.filter(p =>
                p.categoryIds.some(id => allCategoryIds.includes(id))
            );
        }

        // Filter by brands
        if (filters.brandIds.length > 0) {
            filtered = filtered.filter(p =>
                p.brandId && filters.brandIds.includes(p.brandId)
            );
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
    }, [allProducts, filters]);

    // Get active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.categoryIds.length > 0) count += filters.categoryIds.length;
        if (filters.brandIds.length > 0) count += filters.brandIds.length;
        if (filters.priceRange[0] !== priceExtent[0] || filters.priceRange[1] !== priceExtent[1]) count += 1;
        return count;
    }, [filters, priceExtent]);

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            categoryIds: [],
            brandIds: [],
            priceRange: priceExtent as [number, number],
            sort: filters.sort,
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

    // Filter components
    const CategoryFilter = () => (
        <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                {t('products.categories', 'Categories')}
            </h3>
            <div className="space-y-1">
                {flatCategories.map(({ id, name, level }) => (
                    <label
                        key={id}
                        className={cn(
                            'flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-lg transition-colors hover:bg-muted/50',
                            level === 1 && 'ml-4',
                            level === 2 && 'ml-8'
                        )}
                    >
                        <Checkbox
                            checked={filters.categoryIds.includes(id)}
                            onCheckedChange={() => toggleCategory(id)}
                            className="border-2 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                        <span className={cn(
                            'text-sm transition-colors group-hover:text-gold',
                            filters.categoryIds.includes(id) ? 'font-semibold text-gold' : level === 0 ? 'font-semibold text-gold uppercase' : 'text-foreground',
                            level > 0 && !filters.categoryIds.includes(id) && 'text-muted-foreground'
                        )}>
                            {name}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    const BrandFilter = () => (
        <div className="rounded-2xl border-2 border-border bg-background p-6 transition-all duration-300">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                {t('products.brands', 'Brands')}
            </h3>
            <div className="space-y-1">
                {brands.map(brand => (
                    <label
                        key={brand.id}
                        className="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-lg transition-all hover:bg-muted/50"
                    >
                        <Checkbox
                            checked={filters.brandIds.includes(brand.id)}
                            onCheckedChange={() => toggleBrand(brand.id)}
                            className="border-2 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                        <span className={cn(
                            'flex-1 text-sm transition-colors group-hover:text-gold',
                            filters.brandIds.includes(brand.id) ? 'font-semibold text-gold' : 'text-foreground'
                        )}>
                            {brand.name}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {brand.productCount}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );

    const PriceRangeFilter = () => (
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
                        <aside className="hidden w-64 flex-shrink-0 lg:block">
                            <div className="sticky top-24 space-y-6">
                                <CategoryFilter />
                                <BrandFilter />
                                <PriceRangeFilter />

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
                            {activeFilterCount > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {filters.categoryIds.map(catId => {
                                        const cat = flatCategories.find(c => c.id === catId);
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
                                        const brand = brands.find(b => b.id === brandId);
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

                            {/* Sort Dropdown */}
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? t('products.product', 'product') : t('products.products', 'products')}
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
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            href={route('products.show', { slug: product.slug })}
                                            index={index}
                                        />
                                    ))}
                                </div>
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
                            <CategoryFilter />
                            <BrandFilter />
                            <PriceRangeFilter />
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

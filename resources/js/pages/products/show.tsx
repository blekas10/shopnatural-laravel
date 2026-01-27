import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import SEO from '@/components/seo';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/contexts/wishlist-context';
import { useGTM } from '@/hooks/use-gtm';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingCart, Check, X, Heart } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    truncateDescription,
    generateCanonicalUrl,
    generateAlternateUrls,
    parseProductDescriptionForFAQ,
    parseProductDescriptionForHowTo,
    createFAQSchema,
    createHowToSchema,
    createEnhancedProductSchema,
    type ProductSEO,
    type BreadcrumbItem
} from '@/lib/seo';
import type { ProductDetail, ProductVariant, BaseProduct, ProductListItem } from '@/types/product';


interface ProductShowProps {
    product: ProductDetail;
    relatedProducts: BaseProduct[];
}

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
    availableLocales: string[];
}

export default function ProductShow({ product, relatedProducts }: ProductShowProps) {
    const { t, route } = useTranslation();
    const { seo, locale, availableLocales } = usePage<PageProps>().props;
    const { addItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const { viewContent } = useGTM();
    const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'ingredients'>('description');
    const [isAdding, setIsAdding] = useState(false);

    // Variant selection state
    const hasVariants = product.variants && product.variants.length > 0;
    const defaultVariant = hasVariants
        ? product.variants.find(v => v.isDefault) || product.variants[0]
        : null;
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);

    // Initialize selected image based on default variant
    const getInitialImage = () => {
        if (defaultVariant?.image) {
            return {
                id: defaultVariant.id * 1000,
                url: defaultVariant.image,
                altText: `${product.name} - ${defaultVariant.size}`,
                isPrimary: false,
            };
        }
        return product.images?.[0];
    };
    const [selectedImage, setSelectedImage] = useState(getInitialImage());
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Build gallery images array (product images + variant images)
    const galleryImages = useMemo(() => {
        const images = [...(product.images || [])];

        // Add variant images if they exist
        if (product.variants) {
            product.variants.forEach(variant => {
                if (variant.image) {
                    // Check if this image URL is not already in the gallery
                    const exists = images.some(img => img.url === variant.image);
                    if (!exists) {
                        images.push({
                            id: variant.id * 1000,
                            url: variant.image,
                            altText: `${product.name} - ${variant.size}`,
                            isPrimary: false,
                        });
                    }
                }
            });
        }

        return images;
    }, [product.images, product.variants, product.name]);

    // Get current image index for navigation
    const currentImageIndex = useMemo(() => {
        return galleryImages.findIndex(img => img.id === selectedImage?.id);
    }, [galleryImages, selectedImage]);

    // Navigate to next/previous image
    const navigateImage = (direction: 'next' | 'prev') => {
        if (galleryImages.length <= 1) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = currentImageIndex === galleryImages.length - 1 ? 0 : currentImageIndex + 1;
        } else {
            newIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
        }

        setSelectedImage(galleryImages[newIndex]);
    };

    // Get current product data based on variant selection
    const currentPrice = selectedVariant?.price ?? product.price;
    const currentCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
    const currentSku = selectedVariant?.sku ?? product.sku;
    const currentInStock = selectedVariant?.inStock ?? product.inStock;
    const currentStock = selectedVariant?.stock ?? 0;

    // Calculate if on sale
    const isOnSale = currentCompareAtPrice !== null && currentCompareAtPrice > currentPrice;
    const salePercentage = isOnSale
        ? Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100)
        : null;

    // Handle variant selection and update image
    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);

        // If variant has a specific image, show it
        if (variant.image) {
            setSelectedImage({
                id: variant.id * 1000, // Temporary ID for variant image
                url: variant.image,
                altText: `${product.name} - ${variant.size}`,
                isPrimary: false,
            });
        } else {
            // Otherwise, show the first product image
            setSelectedImage(product.images?.[0]);
        }
    };

    const handleAddToCart = () => {
        if (!currentInStock) return;

        setIsAdding(true);

        // Convert ProductDetail to ProductListItem for cart
        const productListItem: ProductListItem = {
            id: product.id,
            name: product.name,
            title: product.title,
            slug: product.slug,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            minPrice: product.minPrice,
            maxPrice: product.maxPrice,
            image: product.image,
            isOnSale: product.isOnSale,
            salePercentage: product.salePercentage,
            brandId: null, // Not available in ProductDetail
            brandName: null,
            categoryIds: product.categories.map(c => c.id),
        };

        addItem(productListItem, selectedVariant, 1);

        // Dispatch custom event to open cart drawer
        window.dispatchEvent(new CustomEvent('openCart'));

        setTimeout(() => setIsAdding(false), 500);
    };

    // Handle wishlist toggle
    const handleWishlistToggle = async () => {
        if (selectedVariant) {
            await toggleItem(product.id, selectedVariant.id, product.name);
            // No toast - user sees visual feedback from heart icon
        }
    };

    // Check if current variant is in wishlist
    const inWishlist = selectedVariant ? isInWishlist(product.id, selectedVariant.id) : false;

    // SEO data preparation
    const siteUrl = seo?.siteUrl || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalUrl = generateCanonicalUrl(siteUrl, currentPath);

    // Build breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: siteUrl },
        { name: t('products.title', 'Products'), url: `${siteUrl}/${locale === 'lt' ? 'lt/produktai' : 'products'}` },
        { name: product.name, url: canonicalUrl },
    ];

    // Add category to breadcrumbs if exists
    if (product.categories.length > 0) {
        const category = product.categories[0];
        breadcrumbs.splice(2, 0, {
            name: category.name,
            url: `${siteUrl}/${locale === 'lt' ? 'lt/produktai' : 'products'}?category=${category.slug}`,
        });
    }

    // Build alternate URLs for hreflang
    const alternateUrls = generateAlternateUrls(
        siteUrl,
        currentPath,
        availableLocales || ['en', 'lt'],
        locale,
        product.alternateSlug
    );

    // Product SEO data for structured data
    // Use parent brand if exists (e.g., "Naturalmente" for sub-brand "Botanic Skincare")
    // Otherwise use direct brand, fallback to first category
    const brandName = product.parentBrand?.name || product.brand?.name || product.categories[0]?.name;

    const productSEO: ProductSEO = useMemo(() => ({
        name: product.name,
        description: truncateDescription(product.metaDescription || product.shortDescription || product.description, 160),
        image: product.image,
        images: product.images?.map(img => img.url),
        price: currentPrice,
        compareAtPrice: currentCompareAtPrice,
        currency: 'EUR',
        availability: currentInStock ? 'InStock' : 'OutOfStock',
        sku: currentSku,
        brand: brandName,
        category: product.categories.map(c => c.name).join(' > '),
        url: canonicalUrl,
    }), [product, currentPrice, currentCompareAtPrice, currentInStock, currentSku, brandName, canonicalUrl]);

    // Generate GEO/AEO schemas for AI search optimization
    const additionalSchemas: object[] = useMemo(() => {
        const schemas: object[] = [];
        const currentLocale = locale as 'en' | 'lt';

        // Parse FAQ from product description (Features, Suitable For, Application sections)
        const faqs = parseProductDescriptionForFAQ(product.description, product.name, currentLocale);
        if (faqs.length > 0) {
            schemas.push(createFAQSchema(faqs));
        }

        // Parse HowTo from Application section
        const howTo = parseProductDescriptionForHowTo(product.description, product.name, currentLocale);
        if (howTo) {
            schemas.push(createHowToSchema(howTo.name, howTo.description, howTo.steps, undefined, product.image));
        }

        // Create enhanced product schema with ingredients
        if (product.ingredients) {
            schemas.push(createEnhancedProductSchema({
                ...productSEO,
                ingredients: product.ingredients,
                volume: selectedVariant?.size,
            }));
        }

        return schemas;
    }, [product, productSEO, locale, selectedVariant]);

    // Track ViewContent event for Facebook CAPI
    useEffect(() => {
        viewContent(
            product.id,
            currentSku,
            product.name,
            currentPrice
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]); // Only fire once on initial mount

    return (
        <>
            <SEO
                title={product.metaTitle}
                description={product.metaDescription || truncateDescription(product.shortDescription || product.description, 160)}
                image={product.image}
                canonical={canonicalUrl}
                alternateUrls={alternateUrls}
                product={productSEO}
                breadcrumbs={breadcrumbs}
                additionalSchemas={additionalSchemas}
            />

            <div className="min-h-screen bg-background pb-[calc(73px+env(safe-area-inset-bottom))] lg:pb-0">
                <MainHeader />

                {/* Breadcrumb */}
                <div className="border-b border-border">
                    <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <Link href={route('products.index')} className="hover:text-foreground transition-colors">
                                {t('products.title', 'Products')}
                            </Link>
                            <ChevronRight className="size-4 shrink-0" />
                            <span className="text-foreground md:hidden">
                                {product.name.split(' ').length > 3
                                    ? product.name.split(' ').slice(0, 3).join(' ') + '...'
                                    : product.name}
                            </span>
                            <span className="text-foreground hidden md:inline">{product.name}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Product Section */}
                    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <motion.div
                                key={selectedImage?.id || 0}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = Math.abs(offset.x) * velocity.x;
                                    if (swipe > 10000) {
                                        navigateImage('prev');
                                    } else if (swipe < -10000) {
                                        navigateImage('next');
                                    }
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="relative overflow-hidden rounded-2xl border-2 border-border bg-background p-6 md:p-8 cursor-grab active:cursor-grabbing lg:cursor-default"
                            >
                                <div className="aspect-square w-full pointer-events-none">
                                    {selectedImage && (
                                        <img
                                            src={selectedImage.url}
                                            alt={selectedImage.altText || product.name}
                                            className="h-full w-full object-contain"
                                        />
                                    )}
                                </div>

                                {/* Sale Badge */}
                                {isOnSale && salePercentage && (
                                    <div className="absolute right-3 top-3 md:right-4 md:top-4 pointer-events-none">
                                        <span className="rounded-full bg-gold px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-gold/30">
                                            -{salePercentage}%
                                        </span>
                                    </div>
                                )}

                                {/* Mobile Image Dots */}
                                {galleryImages.length > 1 && (
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden pointer-events-auto">
                                        {galleryImages.map((image) => (
                                            <button
                                                key={image.id}
                                                onClick={() => setSelectedImage(image)}
                                                className={cn(
                                                    'h-1.5 rounded-full transition-all duration-300',
                                                    selectedImage?.id === image.id
                                                        ? 'w-6 bg-gold'
                                                        : 'w-1.5 bg-muted-foreground/30 hover:bg-gold/50'
                                                )}
                                                aria-label={`View image ${image.id}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Thumbnail Images - Desktop Only */}
                            {galleryImages.length > 1 && (
                                <div className="hidden lg:grid grid-cols-4 gap-3">
                                    {galleryImages.map((image) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setSelectedImage(image)}
                                            className={cn(
                                                'overflow-hidden rounded-xl border-2 p-2 transition-all duration-300',
                                                selectedImage?.id === image.id
                                                    ? 'border-gold shadow-md shadow-gold/20'
                                                    : 'border-border hover:border-gold/40'
                                            )}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.altText || product.name}
                                                className="aspect-square w-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Categories */}
                            {product.categories.length > 0 && (() => {
                                const visibleCategories = showAllCategories
                                    ? product.categories
                                    : product.categories.slice(0, 5);
                                const hasMore = product.categories.length > 5;

                                return (
                                    <div className="flex flex-wrap gap-2">
                                        {visibleCategories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={route('products.index') + `?categories=${category.id}`}
                                                className="rounded-full border border-muted-foreground/30 bg-background/95 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-sm hover:shadow-gold/20"
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                        {hasMore && !showAllCategories && (
                                            <button
                                                onClick={() => setShowAllCategories(true)}
                                                className="rounded-full border border-muted-foreground/30 bg-background/95 px-4 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-sm hover:shadow-gold/20"
                                            >
                                                ...
                                            </button>
                                        )}
                                        {hasMore && showAllCategories && (
                                            <button
                                                onClick={() => setShowAllCategories(false)}
                                                className="rounded-full border border-muted-foreground/30 bg-background/95 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-sm hover:shadow-gold/20"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Product Title */}
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                                    {product.name}
                                </h1>
                               
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <motion.p
                                    key={currentPrice}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={cn(
                                        "text-4xl font-bold transition-colors",
                                        isOnSale ? "text-gold" : "text-foreground"
                                    )}
                                >
                                    €{currentPrice.toFixed(2)}
                                </motion.p>
                                {currentCompareAtPrice && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xl font-medium text-muted-foreground line-through"
                                    >
                                        €{currentCompareAtPrice.toFixed(2)}
                                    </motion.p>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.shortDescription && (
                                <div
                                    className="text-base leading-relaxed text-muted-foreground prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                />
                            )}

                            {/* Variant Selection */}
                            {hasVariants && product.variants && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                                        {t('product.select_size', 'Select Size')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => handleVariantSelect(variant)}
                                                disabled={!variant.inStock}
                                                className={cn(
                                                    'rounded-lg border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer',
                                                    selectedVariant?.id === variant.id
                                                        ? 'border-gold bg-gold/10 text-foreground ring-2 ring-gold/20 shadow-sm'
                                                        : variant.inStock
                                                        ? 'border-muted/80 bg-muted/50 text-foreground hover:border-gold hover:bg-gold/5'
                                                        : 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed line-through'
                                                )}
                                            >
                                                {variant.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SKU & Stock Status */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t('product.sku', 'SKU')}:</span>
                                    <motion.span
                                        key={currentSku}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium text-foreground"
                                    >
                                        {currentSku}
                                    </motion.span>
                                </div>

                                <div className="h-4 w-px bg-border" />

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentInStock ? 'in-stock' : 'out-of-stock'}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center gap-2"
                                    >
                                        {currentInStock ? (
                                            <>
                                                <div className="rounded-full bg-teal-500/10 p-1">
                                                    <Check className="size-3.5 text-teal-500" />
                                                </div>
                                                <span className="font-medium text-teal-500">
                                                    {t('product.in_stock', 'In Stock')}
                                                    {currentStock > 0 && ` (${currentStock})`}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="rounded-full bg-red-500/10 p-1">
                                                    <X className="size-3.5 text-red-500" />
                                                </div>
                                                <span className="font-medium text-red-500">
                                                    {t('product.out_of_stock', 'Out of Stock')}
                                                </span>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Desktop Actions */}
                            <div className="hidden lg:flex gap-3 items-center">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleWishlistToggle}
                                    className={cn(
                                        "h-14 w-14 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                                        inWishlist
                                            ? "border-gold bg-gold/10 text-gold hover:border-gold/60"
                                            : "border-border hover:border-gold hover:text-gold"
                                    )}
                                >
                                    <Heart className={cn("size-5", inWishlist && "fill-current")} />
                                </Button>

                                <Button
                                    size="lg"
                                    disabled={!currentInStock || isAdding}
                                    onClick={handleAddToCart}
                                    className="h-14 rounded-lg border-2 border-gold bg-gold px-8 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-gold disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    <ShoppingCart className="mr-2 size-5" />
                                    {isAdding ? t('shop.adding', 'Adding...') : t('shop.add_to_cart', 'Add to Cart')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="mt-12 lg:mt-16">
                        <div className="border-b border-border">
                            <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={cn(
                                        'border-b-2 pb-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap',
                                        activeTab === 'description'
                                            ? 'border-gold text-gold'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {t('product.description', 'Description')}
                                </button>
                                {product.additionalInformation && (
                                    <button
                                        onClick={() => setActiveTab('additional')}
                                        className={cn(
                                            'border-b-2 pb-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap',
                                            activeTab === 'additional'
                                                ? 'border-gold text-gold'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {t('product.additional_info', 'Additional Info')}
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('ingredients')}
                                    className={cn(
                                        'border-b-2 pb-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap',
                                        activeTab === 'ingredients'
                                            ? 'border-gold text-gold'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {t('product.ingredients', 'Ingredients')}
                                </button>
                            </div>
                        </div>

                        <div className="py-8 max-w-[864px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'description' && (
                                    <motion.div
                                        key="description"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="prose prose-neutral max-w-none dark:prose-invert prose-p:text-foreground/80 prose-headings:text-foreground"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                )}

                                {activeTab === 'additional' && product.additionalInformation && (
                                    <motion.div
                                        key="additional"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="prose prose-neutral max-w-none dark:prose-invert prose-p:text-foreground/80 prose-headings:text-foreground"
                                        dangerouslySetInnerHTML={{ __html: product.additionalInformation }}
                                    />
                                )}

                                {activeTab === 'ingredients' && (
                                    <motion.div
                                        key="ingredients"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="prose prose-neutral max-w-none dark:prose-invert prose-p:text-foreground/80 prose-headings:text-foreground"
                                        dangerouslySetInnerHTML={{ __html: product.ingredients }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-12 lg:mt-16">
                            <h2 className="mb-8 text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                {t('product.related_products', 'Related Products')}
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedProducts.map((relatedProduct) => (
                                    <Link
                                        key={relatedProduct.id}
                                        href={route('products.show', { slug: relatedProduct.slug })}
                                    >
                                        <div className="group h-full overflow-hidden rounded-2xl border-2 border-border bg-background transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10">
                                            <div className="relative overflow-hidden p-6">
                                                <div className="aspect-square w-full">
                                                    <img
                                                        src={relatedProduct.image}
                                                        alt={relatedProduct.name}
                                                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                                {relatedProduct.isOnSale && relatedProduct.salePercentage && (
                                                    <div className="absolute right-3 top-3">
                                                        <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-gold/20">
                                                            -{relatedProduct.salePercentage}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1 p-4">
                                                <h3 className="text-base font-bold uppercase tracking-wide text-foreground line-clamp-2">
                                                    {relatedProduct.name}
                                                </h3>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <p className={cn(
                                                        "text-lg font-bold",
                                                        relatedProduct.compareAtPrice ? "text-gold" : "text-foreground"
                                                    )}>
                                                        €{relatedProduct.price.toFixed(2)}
                                                    </p>
                                                    {relatedProduct.compareAtPrice && (
                                                        <p className="text-sm font-medium text-muted-foreground line-through">
                                                            €{relatedProduct.compareAtPrice.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Footer />

                {/* Mobile Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 lg:hidden">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex flex-col gap-2">
                            {/* Variant Selector Row - Only shown when variants exist */}
                            {hasVariants && product.variants && (
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => handleVariantSelect(variant)}
                                            disabled={!variant.inStock}
                                            className={cn(
                                                'rounded-lg border-2 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer',
                                                selectedVariant?.id === variant.id
                                                    ? 'border-gold bg-gold/10 text-foreground ring-2 ring-gold/20 shadow-sm'
                                                    : variant.inStock
                                                    ? 'border-muted/80 bg-muted/50 text-foreground'
                                                    : 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                            )}
                                        >
                                            {variant.size}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex items-center gap-3">
                                {/* Wishlist Button */}
                                <button
                                    onClick={handleWishlistToggle}
                                    className={cn(
                                        "flex size-12 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300",
                                        inWishlist
                                            ? "border-gold bg-gold/10 text-gold"
                                            : "border-border text-foreground hover:border-gold hover:text-gold"
                                    )}
                                >
                                    <Heart className={cn("size-5", inWishlist && "fill-current")} />
                                </button>

                                {/* Add to Cart Button */}
                                <button
                                    disabled={!currentInStock || isAdding}
                                    onClick={handleAddToCart}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gold bg-gold px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-transparent hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ShoppingCart className="size-4" />
                                    {isAdding ? t('shop.adding', 'Adding...') : t('shop.add_to_cart', 'Add to Cart')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

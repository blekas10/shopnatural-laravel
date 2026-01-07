import { Link } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, Leaf } from 'lucide-react';
import SEO from '@/components/seo';

export default function Error404() {
    const { t, route } = useTranslation();

    return (
        <>
            <SEO
                title={t('error.404_title', 'Page Not Found')}
                description={t('error.404_description', 'The page you are looking for could not be found.')}
            />

            <div className="min-h-screen bg-background flex flex-col">
                <MainHeader />

                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="text-center max-w-2xl mx-auto">
                        {/* Decorative element */}
                        <div className="relative mb-8">
                            <div className="inline-flex items-center justify-center">
                                <div className="relative">
                                    {/* Large 404 with gradient */}
                                    <span className="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-b from-gold/30 to-transparent bg-clip-text text-transparent select-none">
                                        404
                                    </span>
                                    {/* Floating leaf decoration */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <Leaf className="size-16 md:size-20 text-gold animate-pulse" />
                                            <div className="absolute inset-0 blur-xl bg-gold/20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error message */}
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-foreground mb-4">
                            {t('error.404_heading', 'Page Not Found')}
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                            {t('error.404_message', "We couldn't find the page you're looking for. It may have been moved or no longer exists.")}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-gold px-8 py-6 text-sm font-bold uppercase tracking-wide text-black transition-all duration-300 hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/30"
                            >
                                <Link href={route('home')}>
                                    <Home className="mr-2 size-5" />
                                    {t('error.go_home', 'Go to Homepage')}
                                </Link>
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="px-8 py-6 text-sm font-bold uppercase tracking-wide border-2 border-border transition-all duration-300 hover:border-gold hover:text-gold"
                            >
                                <Link href={route('products.index')}>
                                    <Search className="mr-2 size-5" />
                                    {t('error.browse_products', 'Browse Products')}
                                </Link>
                            </Button>
                        </div>

                        {/* Back link */}
                        <div className="mt-8">
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300 hover:text-gold"
                            >
                                <ArrowLeft className="size-4" />
                                {t('error.go_back', 'Go back to previous page')}
                            </button>
                        </div>

                        {/* Helpful links */}
                        <div className="mt-12 pt-8 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('error.helpful_links', 'Or try these helpful links:')}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                                <Link
                                    href={route('contact')}
                                    className="text-foreground transition-colors duration-300 hover:text-gold"
                                >
                                    {t('nav.contact', 'Contact')}
                                </Link>
                                <span className="text-border">|</span>
                                <Link
                                    href={route('about')}
                                    className="text-foreground transition-colors duration-300 hover:text-gold"
                                >
                                    {t('nav.about', 'About Us')}
                                </Link>
                                <span className="text-border">|</span>
                                <Link
                                    href={route('shipping-policy')}
                                    className="text-foreground transition-colors duration-300 hover:text-gold"
                                >
                                    {t('footer.shipping_info', 'Shipping Info')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}

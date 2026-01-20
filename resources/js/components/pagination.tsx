import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    from: number;
    to: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, from, to, total, onPageChange }: PaginationProps) {
    const { t } = useTranslation();

    // Don't show pagination if only 1 page
    if (lastPage <= 1) {
        return null;
    }

    // Generate smart page numbers (1, last, current ±1, with ellipsis)
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        const delta = 1; // Show current ±1 pages

        for (let i = 1; i <= lastPage; i++) {
            // Always show first page
            if (i === 1) {
                pages.push(i);
                continue;
            }

            // Always show last page
            if (i === lastPage) {
                pages.push(i);
                continue;
            }

            // Show current page and neighbors
            if (i >= currentPage - delta && i <= currentPage + delta) {
                pages.push(i);
                continue;
            }

            // Add ellipsis if needed
            if (
                (i === currentPage - delta - 1 && currentPage - delta > 2) ||
                (i === currentPage + delta + 1 && currentPage + delta < lastPage - 1)
            ) {
                // Only add ellipsis if not already the last item
                if (pages[pages.length - 1] !== 'ellipsis') {
                    pages.push('ellipsis');
                }
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="mt-8 space-y-4">
            {/* Showing text */}
            <div className="text-center text-sm text-muted-foreground">
                {t('pagination.showing', 'Showing {from}-{to} of {total} products')
                    .replace('{from}', from.toString())
                    .replace('{to}', to.toString())
                    .replace('{total}', total.toString())}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center justify-center gap-2">
                {/* Previous button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="size-4 sm:mr-1" />
                    <span className="hidden sm:inline">{t('pagination.previous', 'Previous')}</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 justify-center flex-wrap">
                    {pageNumbers.map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-1 sm:px-2 text-muted-foreground"
                                >
                                    ...
                                </span>
                            );
                        }

                        const isActive = page === currentPage;

                        return (
                            <Button
                                key={page}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPageChange(page)}
                                className={cn(
                                    'min-w-[36px] sm:min-w-[40px] h-9 border-2',
                                    isActive
                                        ? 'bg-gold border-gold text-white hover:bg-gold/90 hover:border-gold/90'
                                        : 'border-border hover:border-gold/40'
                                )}
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="hidden sm:inline">{t('pagination.next', 'Next')}</span>
                    <ChevronRight className="size-4 sm:ml-1" />
                </Button>
            </div>
        </div>
    );
}

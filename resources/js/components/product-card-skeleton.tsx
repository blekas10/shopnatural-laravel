import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
    className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
    return (
        <div className={cn('h-full', className)}>
            <div className="h-full flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-background">
                {/* Product Image Skeleton */}
                <div className="relative overflow-hidden p-6">
                    <div className="aspect-square w-full">
                        <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="mt-auto space-y-3 p-4">
                    {/* Title - 2 lines */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Price */}
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
    );
}

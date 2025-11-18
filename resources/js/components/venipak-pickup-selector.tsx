import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Package, Loader2, Info } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export interface VenipakPickupPoint {
    id: number;
    name: string;
    display_name?: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    lat: string;
    lng: string;
    type: number; // 1 = Pickup terminal, 3 = Locker
    pick_up_enabled: number;
    cod_enabled: number;
    max_height?: number;
    max_width?: number;
    max_length?: number;
    working_hours?: string;
}

interface VenipakPickupSelectorProps {
    country: string;
    selectedPickupPoint: VenipakPickupPoint | null;
    onSelect: (point: VenipakPickupPoint) => void;
    error?: string;
    className?: string;
}

export function VenipakPickupSelector({
    country,
    selectedPickupPoint,
    onSelect,
    error,
    className
}: VenipakPickupSelectorProps) {
    const { t } = useTranslation();
    const [pickupPoints, setPickupPoints] = useState<VenipakPickupPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch pickup points
    useEffect(() => {
        if (!country) return;

        const fetchPickupPoints = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/venipak/pickup-points?country=${country}`);
                const data = await response.json();

                if (data.success) {
                    setPickupPoints(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch Venipak pickup points:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPickupPoints();
    }, [country]);

    // Filter pickup points by search query
    const filteredPoints = useMemo(() => {
        if (!searchQuery.trim()) return pickupPoints;

        const query = searchQuery.toLowerCase();
        return pickupPoints.filter(point => {
            const displayName = (point.display_name || point.name || '').toLowerCase();
            const address = (point.address || '').toLowerCase();
            const city = (point.city || '').toLowerCase();
            const zip = (point.zip || '').toLowerCase();

            return displayName.includes(query) ||
                address.includes(query) ||
                city.includes(query) ||
                zip.includes(query);
        });
    }, [pickupPoints, searchQuery]);

    // Group by city for better organization
    const groupedByCity = useMemo(() => {
        const groups: Record<string, VenipakPickupPoint[]> = {};

        filteredPoints.forEach(point => {
            const city = point.city || 'Unknown';
            if (!groups[city]) {
                groups[city] = [];
            }
            groups[city].push(point);
        });

        // Sort cities alphabetically
        return Object.keys(groups)
            .sort()
            .reduce((acc, city) => {
                acc[city] = groups[city];
                return acc;
            }, {} as Record<string, VenipakPickupPoint[]>);
    }, [filteredPoints]);

    const getPointTypeName = (type: number) => {
        return type === 3 ? t('venipak.locker', 'Locker') : t('venipak.pickup_point', 'Pickup Point');
    };

    const getPointTypeIcon = (type: number) => {
        return type === 3 ? <Package className="size-5 text-gold" /> : <MapPin className="size-5 text-gold" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div>
                <Label className="text-sm font-bold uppercase tracking-wide">
                    {t('venipak.select_pickup_point', 'Select Venipak Pickup Point')} *
                </Label>
                {pickupPoints.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('venipak.total_available', '{count} pickup locations available', {
                            count: pickupPoints.length.toString()
                        })}
                    </p>
                )}
            </div>

            {/* Selected Point Display */}
            {selectedPickupPoint && (
                <div className="rounded-lg border-2 border-gold bg-gold/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 flex-1">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
                                {getPointTypeIcon(selectedPickupPoint.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold uppercase text-gold">
                                        {getPointTypeName(selectedPickupPoint.type)}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm">
                                    {selectedPickupPoint.display_name || selectedPickupPoint.name}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {selectedPickupPoint.address}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedPickupPoint.zip} {selectedPickupPoint.city}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelect(null as any)}
                            className="shrink-0 text-xs text-gold hover:underline"
                        >
                            {t('venipak.change', 'Change')}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Search */}
            {!selectedPickupPoint && (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t('venipak.search_placeholder', 'Search by city, address...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Pickup Points List */}
                    <ScrollArea className="h-[400px] rounded-lg border">
                        <div className="p-4">
                            {Object.keys(groupedByCity).length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    {searchQuery
                                        ? t('venipak.no_results', 'No pickup points found')
                                        : t('venipak.no_points', 'No pickup points available')}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedByCity).map(([city, points]) => (
                                        <div key={city}>
                                            {/* City Header */}
                                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                                                {city} ({points.length})
                                            </h3>

                                            {/* Points in this city */}
                                            <div className="space-y-2">
                                                {points.map((point) => (
                                                    <button
                                                        key={point.id}
                                                        type="button"
                                                        onClick={() => onSelect(point)}
                                                        className={cn(
                                                            'w-full rounded-lg border-2 p-3 text-left transition-all hover:border-gold hover:bg-gold/5',
                                                            'border-border bg-background'
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/10">
                                                                {getPointTypeIcon(point.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-semibold uppercase text-gold">
                                                                        {getPointTypeName(point.type)}
                                                                    </span>
                                                                    {point.cod_enabled === 1 && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            • COD
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h4 className="font-semibold text-sm">
                                                                    {point.display_name || point.name}
                                                                </h4>
                                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                                    {point.address}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {point.zip}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Info Message */}
                    {pickupPoints.length > 0 && (
                        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                            <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                                {t('venipak.info_message', 'Select a pickup point where you would like to collect your order. Venipak lockers are available 24/7.')}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

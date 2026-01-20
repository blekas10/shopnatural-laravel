import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
}

export function VenipakLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/venipak.svg"
            alt="Venipak"
            className={cn('h-5 w-auto', className)}
        />
    );
}

export function FedExLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/fedex.svg"
            alt="FedEx"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function StripeLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/stripe.svg"
            alt="Stripe"
            className={cn('h-6 w-auto', className)}
        />
    );
}

export function PayseraLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/paysera.svg"
            alt="Paysera"
            className={cn('h-5 w-auto', className)}
        />
    );
}

export function ApplePayLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/apple-pay.svg"
            alt="Apple Pay"
            className={cn('h-5 w-auto', className)}
        />
    );
}

export function GooglePayLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/google-pay.svg"
            alt="Google Pay"
            className={cn('h-5 w-auto', className)}
        />
    );
}

export function VisaLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/visa.svg"
            alt="Visa"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function MastercardLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/mastercard.svg"
            alt="Mastercard"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function CardLogos({ className }: LogoProps) {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            <VisaLogo className="h-3" />
            <MastercardLogo className="h-3" />
        </div>
    );
}

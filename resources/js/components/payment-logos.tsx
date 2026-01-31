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
            src="/images/logos/fedex.png"
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

// Lithuanian Bank Logos for Paysera
export function SwedbankLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/hanza.png"
            alt="Swedbank"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function SebLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/sb.png"
            alt="SEB"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function LuminorLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/nord.png"
            alt="Luminor"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function CitadeleLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/parex.png"
            alt="Citadele"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function MedicBankLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/mb.png"
            alt="Medicinos Bankas"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function SiauliuBankLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/vb2.png"
            alt="Šiaulių Bankas"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function RevolutLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/revolut.png"
            alt="Revolut"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function WalletLogo({ className }: LogoProps) {
    return (
        <img
            src="/images/logos/wallet.png"
            alt="Wallet"
            className={cn('h-4 w-auto', className)}
        />
    );
}

export function PayseraBankLogos({ className }: LogoProps) {
    return (
        <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
            <SwedbankLogo />
            <SebLogo />
            <LuminorLogo />
            <CitadeleLogo />
            <MedicBankLogo />
            <SiauliuBankLogo />
            <RevolutLogo />
            <WalletLogo />
        </div>
    );
}

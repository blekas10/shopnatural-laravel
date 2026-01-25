@extends('emails.layouts.base')

@section('content')
    @if($locale === 'lt')
        {{-- Lithuanian Version --}}
        <p class="greeting">Sveiki! 👋</p>

        <p class="message">
            Džiaugiamės galėdami pranešti, kad <strong>Shop Natural</strong> parduotuvė atsinaujino!
        </p>

        <p class="message">
            Sukūrėme modernesnę ir patogesnę svetainę, kad jūsų apsipirkimo patirtis būtų dar malonesnė.
            Visi jūsų mėgstami produktai laukia jūsų naujoje platformoje.
        </p>

        <div class="highlight-box">
            <p class="highlight-title">Specialus pasiūlymas jums</p>
            <p class="highlight-value">
                Kaip padėką Jums, siūlome <strong>{{ $discountPercent }}% nuolaidą</strong> jūsų pirmam
                užsakymui naujoje svetainėje! Tiesiog užsiregistruokite ir naudokite kodą:
            </p>
            <p style="text-align: center; margin-top: 16px;">
                <span style="display: inline-block; background: #2a2a2a; color: #C2A363; padding: 12px 24px; border-radius: 8px; font-size: 20px; font-weight: bold; letter-spacing: 2px;">{{ $promoCode }}</span>
            </p>
        </div>

        <p class="message">
            Registracija užtrunka tik minutę, o nuolaida galios jūsų pirmam užsakymui.
        </p>

        <div class="button-container">
            <a href="{{ config('app.url') }}/lt/registracija" class="button">
                Registruotis dabar
            </a>
        </div>

        <p class="message text-muted">
            Turite klausimų? Mūsų komanda visada pasiruošusi padėti – tiesiog parašykite mums!
        </p>

    @else
        {{-- English Version --}}
        <p class="greeting">Hello! 👋</p>

        <p class="message">
            We're excited to announce that <strong>Shop Natural</strong> has been completely renewed!
        </p>

        <p class="message">
            We've created a new, more modern and user-friendly website to make your shopping experience even better.
            All your favorite natural products are waiting for you on our new platform.
        </p>

        <div class="highlight-box">
            <p class="highlight-title">Special offer for you</p>
            <p class="highlight-value">
                As a thank you for your loyalty, we're offering <strong>{{ $discountPercent }}% off</strong> your first
                order on our new website! Simply register and use the code:
            </p>
            <p style="text-align: center; margin-top: 16px;">
                <span style="display: inline-block; background: #2a2a2a; color: #C2A363; padding: 12px 24px; border-radius: 8px; font-size: 20px; font-weight: bold; letter-spacing: 2px;">{{ $promoCode }}</span>
            </p>
        </div>

        <p class="message">
            Registration takes just a minute, and the discount applies to your first order.
        </p>

        <div class="button-container">
            <a href="{{ config('app.url') }}/register" class="button">
                Register Now
            </a>
        </div>

        <p class="message text-muted">
            Have questions? Our team is always ready to help – just reach out!
        </p>
    @endif
@endsection

@section('help_section')
    <div class="help-section">
        <div class="help-column">
            <div class="help-title">
                {{ $locale === 'lt' ? 'Naršykite produktus' : 'Browse Products' }}
            </div>
            <div class="help-description">
                {{ $locale === 'lt' ? 'Atraskite mūsų atnaujintą natūralių produktų kolekciją.' : 'Discover our refreshed collection of natural products.' }}
            </div>
            <a href="{{ config('app.url') }}/{{ $locale === 'lt' ? 'lt/produktai' : 'products' }}" class="help-button">
                {{ $locale === 'lt' ? 'Parduotuvė' : 'Shop Now' }}
            </a>
        </div>
        <div class="help-column">
            <div class="help-title">
                {{ $locale === 'lt' ? 'Susisiekite' : 'Contact Us' }}
            </div>
            <div class="help-description">
                {{ $locale === 'lt' ? 'Turite klausimų? Mielai padėsime!' : 'Have questions? We\'re happy to help!' }}
            </div>
            <a href="{{ config('app.url') }}/{{ $locale === 'lt' ? 'lt/kontaktai' : 'contact' }}" class="help-button">
                {{ $locale === 'lt' ? 'Rašyti' : 'Get in Touch' }}
            </a>
        </div>
    </div>
@endsection

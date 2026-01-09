@extends('emails.layouts.base')

@section('title')
    {{ $locale === 'lt' ? 'Sveiki atvykę į Shop Natural' : 'Welcome to Shop Natural' }}
@endsection

@section('content')
    <h2 class="greeting">
        @if($locale === 'lt')
            Sveiki, {{ $user->name }}! 🎉
        @else
            Hello, {{ $user->name }}! 🎉
        @endif
    </h2>

    <p class="message">
        @if($locale === 'lt')
            Sveiki atvykę į <strong>Shop Natural</strong>! Džiaugiamės, kad prisijungėte prie mūsų bendruomenės.
        @else
            Welcome to <strong>Shop Natural</strong>! We're excited to have you join our community.
        @endif
    </p>

    <p class="message">
        @if($locale === 'lt')
            Kad galėtumėte pilnai naudotis visomis mūsų parduotuvės funkcijomis, patvirtinkite savo el. pašto adresą paspaudę žemiau esantį mygtuką.
        @else
            To get started and access all of our store's features, please verify your email address by clicking the button below.
        @endif
    </p>

    <div class="button-container">
        <a href="{{ $url }}" class="button">
            {{ $locale === 'lt' ? 'Patvirtinti el. paštą' : 'Verify Email Address' }}
        </a>
    </div>

    <div class="highlight-box">
        <div class="highlight-title">
            ✨ {{ $locale === 'lt' ? 'Ko galite tikėtis' : 'What to expect' }}
        </div>
        <div class="highlight-value">
            @if($locale === 'lt')
                <strong>Greitas užsakymas</strong> — Išsaugokite adresus ir mokėjimo būdus<br>
                <strong>Užsakymų istorija</strong> — Peržiūrėkite visus savo užsakymus vienoje vietoje<br>
                <strong>Specialūs pasiūlymai</strong> — Gaukite specialius pasiūlymus ir nuolaidas
            @else
                <strong>Fast checkout</strong> — Save addresses and payment methods<br>
                <strong>Order history</strong> — View all your orders in one place<br>
                <strong>Exclusive offers</strong> — Get special deals and discounts
            @endif
        </div>
    </div>

    {{-- Welcome Promo Code Section --}}
    <div class="promo-box" style="margin-top: 24px; background: linear-gradient(135deg, #C2A363 0%, #D4B87A 100%); border-radius: 12px; padding: 24px; text-align: center;">
        <div style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
            🎁 {{ $locale === 'lt' ? 'Jūsų pasveikinimo dovana' : 'Your Welcome Gift' }}
        </div>
        <div style="font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">
            12% {{ $locale === 'lt' ? 'NUOLAIDA' : 'OFF' }}
        </div>
        <div style="background-color: #ffffff; border-radius: 8px; padding: 12px 20px; display: inline-block; margin: 12px 0;">
            <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #2a2a2a; letter-spacing: 2px;">WELCOME2026</span>
        </div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.9); margin-top: 8px;">
            @if($locale === 'lt')
                Naudokite šį kodą apmokėjimo metu ir sutaupykite pirmo užsakymo metu!
            @else
                Use this code at checkout to save on your first order!
            @endif
        </div>
    </div>

    <div class="divider"></div>

    <p class="message text-muted text-small">
        @if($locale === 'lt')
            Jei kyla problemų spaudžiant mygtuką, nukopijuokite ir įklijuokite žemiau pateiktą URL į savo naršyklę:
        @else
            If you're having trouble clicking the button, copy and paste the URL below into your web browser:
        @endif
    </p>

    <div class="link-box">
        {{ $url }}
    </div>
@endsection

@section('footer_warning')
    @if($locale === 'lt')
        Jei nesikūrėte paskyros Shop Natural, galite ignoruoti šį laišką.
    @else
        If you did not create an account with Shop Natural, you can ignore this email.
    @endif
@endsection

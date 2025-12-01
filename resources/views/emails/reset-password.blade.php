@extends('emails.layouts.base')

@section('title')
    {{ $locale === 'lt' ? 'Atkurti slaptažodį' : 'Reset Password' }}
@endsection

@section('content')
    <h2 class="greeting">
        {{ $locale === 'lt' ? 'Slaptažodžio atkūrimas 🔑' : 'Reset Your Password 🔑' }}
    </h2>

    <p class="message">
        @if($locale === 'lt')
            Gavome jūsų prašymą atkurti slaptažodį. Spauskite žemiau esantį mygtuką, kad sukurtumėte naują slaptažodį.
        @else
            We received a request to reset your password. Click the button below to create a new password.
        @endif
    </p>

    <div class="button-container">
        <a href="{{ $url }}" class="button">
            {{ $locale === 'lt' ? 'Atkurti slaptažodį' : 'Reset Password' }}
        </a>
    </div>

    <div class="highlight-box">
        <div class="highlight-title">
            ⏰ {{ $locale === 'lt' ? 'Svarbu žinoti' : 'Important' }}
        </div>
        <div class="highlight-value">
            @if($locale === 'lt')
                Ši slaptažodžio atkūrimo nuoroda galioja tik <strong>60 minučių</strong>. Po šio laiko turėsite prašyti naujos nuorodos.
            @else
                This password reset link will expire in <strong>60 minutes</strong>. After that, you'll need to request a new link.
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
        Jei jūs neprašėte atkurti slaptažodžio, jokių veiksmų atlikti nereikia. Jūsų paskyra yra saugi.
    @else
        If you did not request a password reset, no action is required. Your account is secure.
    @endif
@endsection

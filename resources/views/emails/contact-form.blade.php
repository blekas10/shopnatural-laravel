@extends('emails.layouts.base')

@php $locale = 'en'; @endphp

@section('title')
    New Contact Form Submission
@endsection

@section('content')
    <h2 class="greeting">
        New Contact Form Message 📬
    </h2>

    <p class="message">
        You have received a new message from the contact form on your website.
    </p>

    <div class="highlight-box">
        <div class="highlight-title">From</div>
        <div class="highlight-value">{{ $senderName }}</div>
    </div>

    <div class="highlight-box" style="background-color: #f8f8f8; border-left-color: #6B7280;">
        <div class="highlight-title" style="color: #374151;">Email</div>
        <div class="highlight-value">
            <a href="mailto:{{ $senderEmail }}" style="color: #C2A363; text-decoration: none;">{{ $senderEmail }}</a>
        </div>
    </div>

    <div class="highlight-box" style="background-color: #f8f8f8; border-left-color: #6B7280;">
        <div class="highlight-title" style="color: #374151;">Subject</div>
        <div class="highlight-value">{{ $formSubject }}</div>
    </div>

    <div class="divider"></div>

    <h3 style="font-size: 14px; margin: 0 0 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
        Message
    </h3>

    <div style="background-color: #f8f8f8; border-left: 4px solid #C2A363; padding: 20px; border-radius: 0 8px 8px 0; white-space: pre-wrap; word-wrap: break-word; font-size: 15px; color: #374151; line-height: 1.6;">{{ $messageContent }}</div>

    <div class="button-container">
        <a href="mailto:{{ $senderEmail }}?subject=Re: {{ $formSubject }}" class="button">
            Reply to {{ $senderName }}
        </a>
    </div>
@endsection

@section('help_section')
    <!-- No help section for admin emails -->
@endsection

@section('footer_warning')
    This message was sent via the contact form on {{ config('app.name') }}
@endsection

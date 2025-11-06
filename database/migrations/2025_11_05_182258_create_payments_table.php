<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_gateway')->default('stripe'); // stripe, paypal, paysera
            $table->string('transaction_id')->unique()->nullable();
            $table->string('payment_intent_id')->unique()->nullable(); // Stripe payment intent ID
            $table->enum('status', ['pending', 'processing', 'succeeded', 'failed', 'refunded'])->default('pending');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('payment_method')->nullable(); // card, bank_transfer, etc.
            $table->string('card_last4')->nullable();
            $table->string('card_brand')->nullable(); // visa, mastercard
            $table->text('failure_reason')->nullable();
            $table->json('gateway_response')->nullable(); // Full response from payment gateway
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['order_id', 'created_at']);
            $table->index('transaction_id');
            $table->index('payment_intent_id');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

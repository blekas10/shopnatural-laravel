<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'payment_reference',
        'invoice_number',
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'payment_intent_id',
        'subtotal',
        'original_subtotal',
        'product_discount',
        'subtotal_excl_vat',
        'vat_amount',
        'tax',
        'shipping_cost',
        'shipping_method',
        'venipak_pickup_point',
        'discount',
        'promo_code_id',
        'promo_code_value',
        'total',
        'currency',
        'shipping_first_name',
        'shipping_last_name',
        'shipping_company',
        'shipping_street_address',
        'shipping_apartment',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'shipping_phone',
        'billing_first_name',
        'billing_last_name',
        'billing_company',
        'billing_street_address',
        'billing_apartment',
        'billing_city',
        'billing_state',
        'billing_postal_code',
        'billing_country',
        'billing_phone',
        'customer_email',
        'customer_notes',
        'locale',
        'tracking_number',
        'shipped_at',
        'delivered_at',
        // Venipak shipment fields
        'venipak_pack_no',
        'venipak_manifest_id',
        'venipak_label_path',
        'venipak_shipment_created_at',
        'venipak_error',
        'venipak_status',
        'venipak_status_updated_at',
        'venipak_delivered_at',
        // Secondary carrier (for global shipments)
        'venipak_carrier_code',
        'venipak_carrier_tracking',
        'venipak_shipment_id',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'original_subtotal' => 'decimal:2',
            'product_discount' => 'decimal:2',
            'subtotal_excl_vat' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'tax' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'venipak_pickup_point' => 'array',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'venipak_shipment_created_at' => 'datetime',
            'venipak_status_updated_at' => 'datetime',
            'venipak_delivered_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart that created this order
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get payment
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the promo code used for this order
     */
    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    /**
     * Get the promo code usage record for this order
     */
    public function promoCodeUsage(): HasOne
    {
        return $this->hasOne(PromoCodeUsage::class);
    }

    /**
     * Get shipping full name
     */
    public function getShippingFullName(): string
    {
        return trim("{$this->shipping_first_name} {$this->shipping_last_name}");
    }

    /**
     * Get billing full name
     */
    public function getBillingFullName(): string
    {
        return trim("{$this->billing_first_name} {$this->billing_last_name}");
    }

    /**
     * Get shipping address formatted
     */
    public function getShippingAddress(): string
    {
        $parts = [
            $this->shipping_street_address,
            $this->shipping_apartment,
            $this->shipping_city,
            $this->shipping_state,
            $this->shipping_postal_code,
            $this->shipping_country,
        ];

        return implode(', ', array_filter($parts));
    }

    /**
     * Check if order is confirmed
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if order is processing
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Check if order is shipped
     */
    public function isShipped(): bool
    {
        return $this->status === 'shipped';
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if order is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if payment is paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['confirmed', 'processing']);
    }

    /**
     * Mark as processing and send confirmation emails
     */
    public function markAsProcessing(bool $sendEmail = true): void
    {
        $this->update(['status' => 'processing']);

        if ($sendEmail) {
            $this->sendOrderConfirmationEmails();
        }
    }

    /**
     * Send order confirmation emails to customer and admin
     */
    public function sendOrderConfirmationEmails(): void
    {
        // Use the locale stored on the order (set during checkout)
        // This ensures emails are sent in the correct language even from webhooks
        $locale = $this->locale ?? app()->getLocale();

        \Log::info('Order: Sending confirmation emails', [
            'order_id' => $this->id,
            'order_number' => $this->order_number,
            'customer_email' => $this->customer_email,
            'locale' => $locale,
        ]);

        // Send to customer in their language
        \Mail::to($this->customer_email)
            ->send(new \App\Mail\OrderConfirmed($this, $locale));

        \Log::info('Order: Customer email queued', [
            'order_id' => $this->id,
            'email' => $this->customer_email,
        ]);

        // Wait for Mailtrap rate limit (remove this when using real mail provider)
        sleep(2);

        // Send to admin always in Lithuanian
        $adminEmail = config('mail.admin_email', 'admin@shopnatural.com');
        \Mail::to($adminEmail)
            ->send(new \App\Mail\OrderConfirmed($this, 'lt'));

        \Log::info('Order: Admin email queued', [
            'order_id' => $this->id,
            'admin_email' => $adminEmail,
        ]);
    }

    /**
     * Mark as shipped
     */
    public function markAsShipped(?string $trackingNumber = null): void
    {
        $this->update([
            'status' => 'shipped',
            'shipped_at' => now(),
            'tracking_number' => $trackingNumber,
        ]);
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'delivered_at' => now(),
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(): void
    {
        if ($this->canBeCancelled()) {
            $this->update(['status' => 'cancelled']);
        }
    }

    /**
     * Generate unique payment reference for payment gateway tracking
     * Format: PAY-XXXXXXXXXX (random string)
     */
    public static function generatePaymentReference(): string
    {
        do {
            $reference = 'PAY-' . strtoupper(\Illuminate\Support\Str::random(10));
        } while (static::where('payment_reference', $reference)->exists());

        return $reference;
    }

    /**
     * Generate unique sequential order number (format: 6002, 6003, etc.)
     * Only called when payment is confirmed.
     */
    public static function generateOrderNumber(): string
    {
        // Get the highest numeric order number
        $lastOrder = static::withTrashed()
            ->whereNotNull('order_number')
            ->whereRaw("order_number REGEXP '^[0-9]+$'")
            ->orderByRaw("CAST(order_number AS UNSIGNED) DESC")
            ->first();

        if ($lastOrder && is_numeric($lastOrder->order_number)) {
            // Increment the last number
            $nextNumber = (int) $lastOrder->order_number + 1;
        } else {
            // Start from 6002
            $nextNumber = 6002;
        }

        return (string) $nextNumber;
    }

    /**
     * Assign order number when payment is confirmed
     */
    public function assignOrderNumber(): void
    {
        if (!$this->order_number) {
            $this->update(['order_number' => static::generateOrderNumber()]);
        }
    }

    /**
     * Generate unique sequential invoice number (format: IN001362, IN001363, etc.)
     * Invoice numbers are only assigned when payment is confirmed.
     */
    public static function generateInvoiceNumber(): string
    {
        // Get the highest invoice number
        $lastOrder = static::withTrashed()
            ->whereNotNull('invoice_number')
            ->whereRaw("invoice_number REGEXP '^IN[0-9]+$'")
            ->orderByRaw("CAST(SUBSTRING(invoice_number, 3) AS UNSIGNED) DESC")
            ->first();

        if ($lastOrder && preg_match('/^IN(\d+)$/', $lastOrder->invoice_number, $matches)) {
            // Increment the last number
            $nextNumber = (int) $matches[1] + 1;
        } else {
            // Start from 1362 (continuing from IN001361)
            $nextNumber = 1362;
        }

        return 'IN' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Assign invoice number when payment is confirmed
     */
    public function assignInvoiceNumber(): void
    {
        if (!$this->invoice_number) {
            $this->update(['invoice_number' => static::generateInvoiceNumber()]);
        }
    }

    /**
     * Scope: Only confirmed orders
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope: Only processing orders
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope: Only shipped orders
     */
    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }

    /**
     * Scope: Only completed orders
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Only cancelled orders
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope: Only paid orders
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Get billing address formatted
     */
    public function getBillingAddress(): string
    {
        $parts = [
            $this->billing_street_address,
            $this->billing_apartment,
            $this->billing_city,
            $this->billing_state,
            $this->billing_postal_code,
            $this->billing_country,
        ];

        return implode(', ', array_filter($parts));
    }

    /**
     * Get total items count
     */
    public function getTotalItemsCount(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Check if order has tracking number
     */
    public function hasTracking(): bool
    {
        return !empty($this->tracking_number);
    }

    /**
     * Get formatted order date
     */
    public function getFormattedOrderDate(): string
    {
        return $this->created_at->format('M d, Y');
    }
}

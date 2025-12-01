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
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'payment_intent_id',
        'subtotal',
        'tax',
        'shipping_cost',
        'shipping_method',
        'venipak_pickup_point',
        'discount',
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
        'tracking_number',
        'shipped_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'venipak_pickup_point' => 'array',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
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
        $locale = app()->getLocale();

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
     * Generate unique order number
     */
    public static function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(uniqid());
        } while (static::where('order_number', $orderNumber)->exists());

        return $orderNumber;
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

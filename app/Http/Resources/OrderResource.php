<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'paymentReference' => $this->payment_reference,
            'invoiceNumber' => $this->invoice_number,
            'status' => $this->status,
            'paymentStatus' => $this->payment_status,

            // Price breakdown
            'originalSubtotal' => (float) ($this->original_subtotal ?? $this->subtotal),
            'productDiscount' => (float) ($this->product_discount ?? 0),
            'subtotal' => (float) $this->subtotal,
            'subtotalExclVat' => (float) ($this->subtotal_excl_vat ?? ($this->subtotal / 1.21)),
            'vatAmount' => (float) ($this->vat_amount ?? ($this->subtotal - ($this->subtotal / 1.21))),
            'shippingCost' => (float) $this->shipping_cost,
            'promoCode' => $this->promo_code_id ? [
                'code' => $this->promoCode?->code,
                'value' => $this->promo_code_value,
            ] : null,
            'promoCodeDiscount' => (float) ($this->discount ?? 0),
            'total' => (float) $this->total,
            'currency' => $this->currency,

            // Shipping address
            'shippingAddress' => [
                'fullName' => $this->getShippingFullName(),
                'firstName' => $this->shipping_first_name,
                'lastName' => $this->shipping_last_name,
                'company' => $this->shipping_company,
                'streetAddress' => $this->shipping_street_address,
                'apartment' => $this->shipping_apartment,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'postalCode' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
                'phone' => $this->shipping_phone,
            ],

            // Billing address
            'billingAddress' => [
                'fullName' => $this->getBillingFullName(),
                'firstName' => $this->billing_first_name,
                'lastName' => $this->billing_last_name,
                'company' => $this->billing_company,
                'streetAddress' => $this->billing_street_address,
                'apartment' => $this->billing_apartment,
                'city' => $this->billing_city,
                'state' => $this->billing_state,
                'postalCode' => $this->billing_postal_code,
                'country' => $this->billing_country,
                'phone' => $this->billing_phone,
            ],

            // Customer details
            'customerEmail' => $this->customer_email,
            'customerNotes' => $this->customer_notes,

            // Order items (always include as array, empty if not loaded)
            'items' => $this->when($this->relationLoaded('items'),
                OrderItemResource::collection($this->items),
                []
            ),

            // Payment info (when loaded, but without sensitive details)
            $this->mergeWhen($this->relationLoaded('payment'), [
                'payment' => $this->payment ? [
                    'method' => $this->payment->payment_method,
                    'status' => $this->payment->status,
                    'transactionId' => $this->payment->transaction_id,
                ] : null,
            ]),

            // Shipping/Delivery info
            'shippingMethod' => $this->shipping_method,
            'venipakPickupPoint' => $this->venipak_pickup_point,
            'trackingNumber' => $this->tracking_number,
            'shippedAt' => $this->shipped_at?->toIso8601String(),
            'completedAt' => $this->delivered_at?->toIso8601String(),

            // Venipak shipment info
            'venipakPackNo' => $this->venipak_pack_no,
            'venipakTrackingUrl' => $this->venipak_pack_no
                ? 'https://go.venipak.lt/ws/tracking.php?type=1&output=html&code=' . $this->venipak_pack_no
                : null,
            'venipakShipmentCreatedAt' => $this->venipak_shipment_created_at?->toIso8601String(),
            'venipakStatus' => $this->venipak_status,
            'venipakStatusUpdatedAt' => $this->venipak_status_updated_at?->toIso8601String(),
            'venipakDeliveredAt' => $this->venipak_delivered_at?->toIso8601String(),
            // Secondary carrier info (for global shipments)
            'venipakCarrierCode' => $this->venipak_carrier_code,
            'venipakCarrierTracking' => $this->venipak_carrier_tracking,
            'venipakShipmentId' => $this->venipak_shipment_id,

            // Timeline for frontend display
            'timeline' => [
                'ordered' => $this->created_at->toIso8601String(),
                'processing' => $this->isProcessing() || $this->isShipped() || $this->isCompleted() ? $this->updated_at->toIso8601String() : null,
                'shipped' => $this->shipped_at?->toIso8601String(),
                'completed' => $this->delivered_at?->toIso8601String(),
                'cancelled' => $this->isCancelled() ? $this->updated_at->toIso8601String() : null,
            ],

            // Status helpers
            'canBeCancelled' => $this->canBeCancelled(),
            'isPaid' => $this->isPaid(),

            // Timestamps
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}

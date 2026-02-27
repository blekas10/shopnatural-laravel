<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('fb_fbp')->nullable()->after('locale');
            $table->string('fb_fbc')->nullable()->after('fb_fbp');
            $table->string('fb_client_ip', 45)->nullable()->after('fb_fbc');
            $table->string('fb_user_agent')->nullable()->after('fb_client_ip');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['fb_fbp', 'fb_fbc', 'fb_client_ip', 'fb_user_agent']);
        });
    }
};

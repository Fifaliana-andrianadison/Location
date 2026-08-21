<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('tenant_invoices');
        Schema::dropIfExists('bien_equipements');
        Schema::dropIfExists('tenants');
        Schema::dropIfExists('candidatures');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('images');
        Schema::dropIfExists('biens');
    }

    public function down(): void
    {
        // Legacy tables are intentionally not restored.
    }
};

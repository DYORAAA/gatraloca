<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_photos', function (Blueprint $table): void {
            $table->id();
            $table->string('section', 20)->index();
            $table->string('group_name', 50)->nullable();
            $table->string('title', 150)->nullable();
            $table->string('photo_path');
            $table->timestamps();

            $table->index(['section', 'group_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_photos');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePurchasingDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchasing_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchasing_brief_id');
            $table->unsignedBigInteger('product_id');
            $table->float('qty');
            $table->enum('units', ['kg','l','per unit']);
            $table->float('unit_price');
            $table->float('total_price');
            $table->float('discount_percentage')->nullable();
            $table->dateTime('expire_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('purchasing_details');
    }
}

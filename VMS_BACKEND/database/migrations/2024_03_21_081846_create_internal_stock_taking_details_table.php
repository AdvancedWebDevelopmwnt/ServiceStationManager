<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInternalStockTakingDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_stock_taking_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('IST_id');
            $table->unsignedBigInteger('product_id');
            $table->float('qty');
            $table->enum('units', ['kg','l','per unit']);
            $table->boolean('isReturned')->default(false);
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
        Schema::dropIfExists('internal_stock_taking_details');
    }
}

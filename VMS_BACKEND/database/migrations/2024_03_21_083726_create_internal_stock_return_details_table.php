<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInternalStockReturnDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_stock_return_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ISR_id');
            $table->unsignedBigInteger('product_id');
            $table->float('qty');
            $table->enum('units', ['kg','l','per unit']);
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
        Schema::dropIfExists('internal_stock_return_details');
    }
}

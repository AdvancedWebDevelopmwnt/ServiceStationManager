<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockFlowsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stock_flows', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('stock_id');
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->float('stock_in')->nullable();
            $table->float('stock_out')->nullable();
            $table->string('reason')->nullable();
            $table->enum('transaction_type', ['purchasing', 'internal_stock_taking', 'internal_stock_return', 'sales', 'stock_adjustment']);
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->unsignedBigInteger('created_by');
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
        Schema::dropIfExists('stock_flows');
    }
}

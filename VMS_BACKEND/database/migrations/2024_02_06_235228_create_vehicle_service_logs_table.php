<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVehicleServiceLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vehicle_service_logs', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_number');   
            $table->float('millage')->nullable(); 
            $table->float('oil_litters')->nullable();
            $table->enum('status',['Pending','Completed','Ongoing']);
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
        Schema::dropIfExists('vehicle_service_logs');
    }
}

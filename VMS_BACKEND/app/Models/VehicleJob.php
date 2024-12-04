<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_service_log_id',
        'job_id',
        'status'
    ];
}

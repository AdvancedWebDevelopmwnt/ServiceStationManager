<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleServiceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_number',
        'millage',
        'oil_litters',
        'status',

    ];
}

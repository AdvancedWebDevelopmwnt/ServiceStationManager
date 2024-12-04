<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'brand_id',
        'vehicle_number',
        'vehicle_model',
        'year_of_made',
        'engine_capacity',
        'customer_id',
        'fuel_type',
        'remark'
    ];
}

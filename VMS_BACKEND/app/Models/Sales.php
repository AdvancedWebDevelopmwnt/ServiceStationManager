<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'total_price',
        'discount',
        'net_price',
        'paid_amount',
        'bill_number',
        'created_by',
    ];


}

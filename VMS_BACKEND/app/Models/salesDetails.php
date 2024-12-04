<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class salesDetails extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_id',
        'product_id',
        'sales_name',
        'qty',
        'unit_price',
        'discount',
    ];

}

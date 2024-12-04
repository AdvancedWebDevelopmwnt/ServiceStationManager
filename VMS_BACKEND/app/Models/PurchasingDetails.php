<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchasingDetails extends Model
{
    use HasFactory;

    protected $fillable = [
       'purchasing_brief_id',
       'product_id',
       'qty',
       'units',
       'unit_price',
       'total_price',
       'discount_percentage',
       'expire_date',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalStockReturnDetails extends Model
{
    use HasFactory;

    protected $fillable = [
            'ISR_id',
            'product_id',
            'qty',
            'units',
        ];
}

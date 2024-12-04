<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalStockTakingDetails extends Model
{
    use HasFactory;

    protected $fillable = [
            'IST_id',
            'product_id',
            'qty',
            'units',
            'isReturned',
        ];
}

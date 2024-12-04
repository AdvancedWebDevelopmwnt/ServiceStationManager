<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'vehicle_id',
        'stock_in',
        'stock_out',
        'reason',
        'transaction_type',
        'transaction_id',
        'created_by'
    ];
}


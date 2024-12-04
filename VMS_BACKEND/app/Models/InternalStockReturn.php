<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalStockReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'returned_by',
        'IST_id',
        'created_by',
        'isCompleted'
    ];
}

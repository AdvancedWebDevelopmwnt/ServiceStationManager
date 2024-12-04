<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalStockTaking extends Model
{
    use HasFactory;

    protected $fillable = [
            'vehicle_id',
            'taken_by',
            'created_by',
            'isCompleted',
        ];
}

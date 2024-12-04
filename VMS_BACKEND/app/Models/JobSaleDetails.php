<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobSaleDetails extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'job_id',
        'unit_price',
        'total_price',
        'discount',
    ];
}

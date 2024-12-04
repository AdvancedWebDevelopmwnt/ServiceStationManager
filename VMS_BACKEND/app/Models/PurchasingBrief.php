<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchasingBrief extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'bill_total_amount',
        'bill_total_discount',
        'manual_GRN_number',
        'system_GRN_number',
    ];
}

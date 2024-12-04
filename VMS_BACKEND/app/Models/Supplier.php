<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $fillable =[
        'name',
        'brand_name',
        'contact_no',
        'email',
        'address',
        'bank_name',
        'branch_name',
        'account_number',
        // 'disabled'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemGrnNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'system_GRN_number',
    ];
}

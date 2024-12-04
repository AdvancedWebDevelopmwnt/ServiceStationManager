<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperAdmin extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $password = Hash::make('123456');

        DB::table('users')->insert([
            'id' => 1,
            'name' => 'Super Admin',
            'first_name'=>'Super',
            'last_name'=>'Admin',
            'email' => 'info@neurascripts.com',
            'contact' => '0715904735',
            'username' => 'superadmin',
            'role' => 1,
            'password' => $password,
            'created_at' => DB::raw('CURRENT_TIMESTAMP'),
            'updated_at' => DB::raw('CURRENT_TIMESTAMP')
        ]);
    }
}

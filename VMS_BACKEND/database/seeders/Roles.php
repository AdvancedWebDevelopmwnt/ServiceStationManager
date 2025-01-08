<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Roles extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $allPermissionGroups = Permission::all();
        $allPermissions = "";

        foreach ($allPermissionGroups as $permissionRow) {
            $allPermissions .="|".$permissionRow['permissions'];
        }

        $allPermissions = substr($allPermissions, 1);


        DB::table('roles')->truncate();


        DB::table('roles')->updateOrInsert([
            'id'         => 1,
        ],[
            'user_type'     => 'BACKEND',
            'name'     => 'Super Admin',
            'permissions'   => 'super-permission',
            'created_at'    => DB::raw('CURRENT_TIMESTAMP'),
            'updated_at'    => DB::raw('CURRENT_TIMESTAMP')
        ]);


        DB::table('roles')->updateOrInsert([
            'id'         => 2,
        ],[
            'user_type'     => 'BACKEND',
            'name'     => 'System Admin',
            'permissions'   => $allPermissions,
            'created_at'    => DB::raw('CURRENT_TIMESTAMP'),
            'updated_at'    => DB::raw('CURRENT_TIMESTAMP')
        ]);


        DB::table('roles')->updateOrInsert([
            'id'         => 2,
        ],[
            'user_type'     => 'BACKEND',
            'name'     => 'customer',
            'permissions'   => "customer-permission",
            'created_at'    => DB::raw('CURRENT_TIMESTAMP'),
            'updated_at'    => DB::raw('CURRENT_TIMESTAMP')
        ]);

      
    }
}

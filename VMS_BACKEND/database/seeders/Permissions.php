<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Permissions extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $systemPermissions = [];

        $group_name = 'User Management';

        $hasPermission = '';
        $hasPermission .= '|user-list';
        $hasPermission .= '|user-create';
        $hasPermission .= '|user-edit';
        $hasPermission .= '|user-delete';
        $hasPermission .= '|password-reset';
      

        array_push($systemPermissions, [$group_name, $hasPermission]);

       
        $group_name = 'Role Management';

        $hasPermission = '';
        $hasPermission .= '|role-list';
        $hasPermission .= '|role-create';
        $hasPermission .= '|role-edit';
        $hasPermission .= '|role-delete';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        $group_name = 'Vehicle Brand Management';

        $hasPermission = '';
        $hasPermission .= '|brand-list';
        $hasPermission .= '|brand-create';
        $hasPermission .= '|brand-edit';
        $hasPermission .= '|brand-delete';
       

        array_push($systemPermissions, [$group_name, $hasPermission]);

        
        $group_name = 'Vehicle Registration - Admin Portal';
        
        $hasPermission = '';
        $hasPermission .= '|vehicle-registration-list';
        $hasPermission .= '|vehicle-registration-create';
        $hasPermission .= '|vehicle-registration-edit';
        $hasPermission .= '|vehicle-registration-view';

        array_push($systemPermissions, [$group_name, $hasPermission]);

        
        $group_name = 'Job Management';

        $hasPermission = '';
        $hasPermission .= '|job-list';
        $hasPermission .= '|job-create';
        $hasPermission .= '|job-edit';
        $hasPermission .= '|job-delete';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        $group_name = 'Product Management';

        $hasPermission = '';
        $hasPermission .= '|product-list';
        $hasPermission .= '|product-create';
        $hasPermission .= '|product-edit';
        $hasPermission .= '|product-delete';

        array_push($systemPermissions, [$group_name, $hasPermission]);

        $group_name = 'Vehicle Service - Admin Portal';

        $hasPermission = '';
        $hasPermission .= '|service-list';
        $hasPermission .= '|service-view';
       
        array_push($systemPermissions, [$group_name, $hasPermission]);

        
        $group_name = 'customer Management';

        $hasPermission = '';
        $hasPermission .= '|customer-list';
        $hasPermission .= '|customer-create';
        $hasPermission .= '|customer-edit';
        $hasPermission .= '|customer-delete';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        $group_name = 'Supplier Management';

        $hasPermission = '';
        $hasPermission .= '|supplier-list';
        $hasPermission .= '|supplier-create';
        $hasPermission .= '|supplier-edit';
        $hasPermission .= '|supplier-delete';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        $group_name = 'Vehicle Log Management';

        $hasPermission = '';
        $hasPermission .= '|vehicle-log-list';
        $hasPermission .= '|vehicle-log-view';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        
        $group_name = 'Service Portal Access';

        $hasPermission = '';
        $hasPermission .= '|vehicle-registration';
        $hasPermission .= '|vehicle-supervise';
        $hasPermission .= '|stock-approval';
        $hasPermission .= '|stock-reject';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        $group_name = 'Job Management';

        $hasPermission = '';
        $hasPermission .= '|job-list';
        $hasPermission .= '|job-create';
        $hasPermission .= '|job-edit';
        $hasPermission .= '|job-delete';

        array_push($systemPermissions, [$group_name, $hasPermission]);


        // $group_name = 'Department Management';

        // $hasPermission = '';
        // $hasPermission .= '|department-list';
        // $hasPermission .= '|department-create';
        // $hasPermission .= '|department-edit';
        // $hasPermission .= '|department-delete';

        // array_push($systemPermissions, [$group_name, $hasPermission]);


        // $group_name = 'Branch Management';

        // $hasPermission = '';
        // $hasPermission .= '|branch-list';
        // $hasPermission .= '|branch-create';
        // $hasPermission .= '|branch-edit';
        // $hasPermission .= '|branch-delete';

        // array_push($systemPermissions, [$group_name, $hasPermission]);


       
        // $group_name = 'Access Management';

        // $hasPermission = '';
        // // $hasPermission .= '|all-branch-access';
        // $hasPermission .= '|activity-log';

        // array_push($systemPermissions, [$group_name, $hasPermission]);

       
        // $group_name = 'Report Management';

        // $hasPermission = '';
        // $hasPermission .= '|report-view';
        // $hasPermission .= '|report-export';

        // array_push($systemPermissions, [$group_name, $hasPermission]);

       
       
        DB::table('permissions')->truncate();

        foreach ($systemPermissions as $permission) {

            DB::table('permissions')->updateOrInsert([
                'user_type' => 'backend',
                'group_name' => $permission[0],
                'permissions' => substr($permission[1], 1),
                'created_at' => DB::raw('CURRENT_TIMESTAMP'),
                'updated_at' => DB::raw('CURRENT_TIMESTAMP')
            ]);

        }

        // automatically update System Admin Permissions
       
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Role;

class RoleController extends Controller
{

    public function list()
    {
        try {
            $roles = Role::whereNull('deleted_at')->where('disabled',false)->get();
           
            return response()->json([
               'status' => true,
                'role' => $roles
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function store(Request $request)
    {
        try {
            //Validated
            $validateRole = Validator::make($request->all(), 
            [
                'name' =>'required',
                'permissions'=>'required',
            ]);

            if($validateRole->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' => $validateRole->errors()
                ], 401);
            }

            $role = Role::create([
                'name' => $request->name,
                'permissions' => $request->permissions
            ]);

            return response()->json([
               'status' => true,
               'message' => 'Role Created Successfully',
                'role' => $role
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function show($id)
    {
        try{
            $roles = Role::whereNull('deleted_at')->where('id',$id)->first();

            return response()->json([
                'status' => true,
                 'role' => $roles
             ], 200);

        }catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        try {
          
            $role= Role::find($id);
            if($role){
                $role->update([
                    'name' => $request->name,
                    'permissions' => $request->permissions,
                    'disabled' =>$request->status
                ]);
            
                return response()->json([
                    'status' => true,
                    'message' => 'Role Updated Successfully',
                     'branch' => $role
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Role Not Found'
                ], 404);
            }

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }


    public function destroy($id)
    {
        try {
            //Validated
    
            $role = Role::find($id);
            if($role){
                $role->delete();
    
                return response()->json([
                    'status' => true,
                    'message' => 'Role Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                    'status' => false,
                    'message' => 'Role Not Found'
                ], 404);
            }

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }
}

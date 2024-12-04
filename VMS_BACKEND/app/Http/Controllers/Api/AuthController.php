<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

class AuthController extends Controller
{

    public function loginUser(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), 
            [
                'username' => 'required',
                'password' => 'required'
            ]);

            if($validateUser->fails()){
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 200);
            }

            if(!Auth::attempt($request->only(['username', 'password']))){
                return response()->json([
                    'status' => false,
                    'message' => 'Username & Password does not match with our record.',
                ], 200);
            }

            $user = User::select('users.*', 'roles.name as userRole','roles.deleted_at')
            ->where('username', $request->username)
            ->where('users.disabled', false)
            ->join('roles', 'roles.id', '=', 'users.role')
            ->whereNull('users.deleted_at')
            ->whereNull('roles.deleted_at')
            ->first();

            $permissionsList = $this->GetPermissions($user);
            

            return response()->json([
                'status' => true,
                'message' => 'User Logged In Successfully',
                'user'=>$user,
                'token' => $user->createToken("API TOKEN")->plainTextToken,
                'permissions' => $permissionsList
            ], 200);

             $user = User::select('users.*', 'roles.name as userRole','roles.deleted_at')
        ->where('username', $request->username)
        ->where('users.disabled', false)
        ->join('roles', 'roles.id', '=', 'users.role')
        ->whereNull('users.deleted_at')
        ->whereNull('roles.deleted_at')
        ->first();

        if ($user === null) {
            return response()->json([
                'status' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $permissionsList = $this->GetPermissions($user);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
          'status' => true,
          'message' => 'User Logged Out Successfully'
        ], 200);
    }


    public function GetPermissions($user)
    {
        $allPermissions = Role::select('name', 'permissions')
        ->where('id', $user->role)
        ->where('disabled', false)
        ->whereNull('deleted_at')
        ->first();

        $allPermissions = Role::select('name', 'permissions')
        ->where('id', $user->role)
        ->where('disabled', false)
        ->whereNull('deleted_at')
        ->first();

        $permissionList = [];

        if ($allPermissions !== false) {
            $tmpPermission = [];
            $tmpPermission['role'] = $allPermissions->name;
            $tmpPermission['permission_list'] = [];

            $currentPermissionList = explode('|', $allPermissions->permissions);

            foreach ($currentPermissionList as $currentPermission) {
                // You may add additional checks here if needed
                array_push($tmpPermission['permission_list'], $currentPermission);
            }

            // remove empty permission groups
            if (sizeof($tmpPermission['permission_list']) > 0) {
                array_push($permissionList, $tmpPermission);
            }
        }

        return $permissionList;
    }
}

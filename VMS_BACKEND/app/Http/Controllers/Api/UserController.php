<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function list()
    {
        try {
            $users = User::select('users.*', 'roles.name as userRole')
                ->join('roles', 'roles.id', '=', 'users.role')
                ->whereNull('users.deleted_at')
                ->get();

            return response()->json([
                'status' => true,
                'user' => $users
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    //get user by id
    public function getUserData($id)
    {
        try {
            $user = User::find($id);
            if ($user) {
                return response()->json([
                    'status' => true,
                    'user' => $user
                ], 200);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'User is Not Found'
                ], 404);
            }
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
            $validateUser = Validator::make(
                $request->all(),
                [
                    'username' => 'required|unique:users,username',
                    'first_name' => 'required',
                    'last_name' => 'required',
                    'password' => 'required',
                    'role' => 'required',

                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            $user = User::create([
                'name' => $request->first_name . ' ' . $request->first_name,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'contact' => $request->contact,
                'username' => $request->username,
                'email' => $request->email,
                'role' => $request->role,
                'password' => Hash::make($request->password)
            ]);

            return response()->json([
                'status' => true,
                'message' => 'User Created Successfully',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if ($user) {
                // Check if another user already uses the email
                $existingUser = User::where('email', $request->email)->where('id', '!=', $id)->first();
                if ($existingUser) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Email Address already exists',
                    ], 400);
                } else {

                    $validateUser = Validator::make(
                        $request->all(),
                        [
                            'username' => 'required|unique:users,username,' . $id,
                            'first_name' => 'required',
                            'last_name' => 'required',
                            'role' => 'required',
                        ]
                    );

                    if ($validateUser->fails()) {
                        return response()->json([
                            'status' => false,
                            'message' => 'validation error',
                            'errors' => $validateUser->errors()
                        ], 400);
                    }

                    $updateData = [
                        'name' => $request->first_name . ' ' . $request->last_name,
                        'first_name' => $request->first_name,
                        'last_name' => $request->last_name,
                        'contact' => $request->contact,
                        'username' => $request->username,
                        'role' => $request->role,
                    ];

                    $user->update($updateData);

                    return response()->json([
                        'status' => true,
                        'message' => 'User Updated Successfully',
                    ], 200);
                }
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'User is Not Found'
                ], 404);
            }
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function updatePassword(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if ($user) {
                $validatePassword = Validator::make($request->all(), [
                    'password' => 'required',
                ]);

                if ($validatePassword->fails()) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Validation error',
                        'errors' => $validatePassword->errors()
                    ], 400);
                }

                $user->update([
                    'password' => Hash::make($request->password)
                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Password Updated Successfully',
                ], 200);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'User is Not Found'
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
            $user = User::find($id);
            if($user){
                $user->delete();

                return response()->json([
                   'status' => true,
                   'message' => 'User Account Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'User Account Not Found'
                ], 404);
            }


        }catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
        }
    }

    public function getAllPermissions()
    {
        // \log::info('get all permissions');
        $permissions = Permission::select('group_name', 'permissions')->get();

        return response()->json([
            'status' => true,
            'permissions' =>  $permissions
        ], 200);
    }

}

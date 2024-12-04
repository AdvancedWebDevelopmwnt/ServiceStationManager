<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Branch;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    public function list()
    {
        try {
            $branches = Branch::all();
           
            return response()->json([
               'status' => true,
                'branch' => $branches 
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
            ]);

            if($validateRole->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' => $validateRole->errors()
                ], 422);
            }

            $role = Branch::create([
                'name' => $request->name,
            ]);

            return response()->json([
               'status' => true,
               'message' => 'Branch Created Successfully',
                'role' => $role
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
        
            $branch = Branch::find($id);
            if($branch){
                $branch->update([
                    'name' => $request->name,
                    'disabled' =>$request->status
                ]);
            
                return response()->json([
                    'status' => true,
                    'message' => 'Branch Updated Successfully',
                     'branch' => $branch
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Branch Not Found'
                ], 404);
            }
    
          

        } catch (Exception $th) {
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
            $branch = Branch::find($id);
            if($branch){
                $branch->update([
                    'deleted' => true,
                ]);
    
                return response()->json([
                   'status' => true,
                   'message' => 'Branch Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Branch Not Found'
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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleBrand;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleBrandController extends Controller
{
    public function list()
    {
        try {
            $brand = VehicleBrand::whereNull('deleted_at')->where('disabled',false)->get();
           
            return response()->json([
               'status' => true,
                'brand' => $brand 
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
                ], 401);
            }

            $checkExist = VehicleBrand::where('name',$request->name)->whereNull('deleted_at')->first();

            if($checkExist){
                return response()->json([
                    'status' => false,
                    'message' => 'Brand name already exists',
                 ], 200);
            }

            $category = VehicleBrand::create([
                'name' => $request->name,
            ]);

            return response()->json([
               'status' => true,
               'message' => 'Vehicle Brand Created Successfully',
                'category' => $category
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
            $roles = VehicleBrand::whereNull('deleted_at')->where('id',$id)->first();

            return response()->json([
                'status' => true,
                 'brand' => $roles
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
        
            $brand = VehicleBrand::find($id);
            if($brand){
                $brand->update([
                    'name' => $request->name,
                    'disabled' =>$request->disabled
                ]);
            
                return response()->json([
                    'status' => true,
                    'message' => 'Vehicle Brand Updated Successfully',
                    'brand' => $brand
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Vehicle Brand Not Found'
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
            $category = VehicleBrand::find($id);
            if($category){
                $category->delete();
    
                return response()->json([
                   'status' => true,
                   'message' => 'Vehicle Brand Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Vehicle Brand Not Found'
                ], 404);
            }
          

        }catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
        }
    }
}

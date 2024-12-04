<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// use App\Models\VehicleModel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleModelController extends Controller
{
    // public function list()
    // {
    //     try {
    //         $model = VehicleModel::select('vehicle_models.*','vehicle_brands.name as brand_name','vehicle_brands.deleted_at')
    //         ->join('vehicle_brands','vehicle_models.brand_id','=','vehicle_brands.id')
    //         ->whereNull('vehicle_brands.deleted_at')
    //         ->whereNull('vehicle_models.deleted_at')
    //         ->get();
           
    //         return response()->json([
    //            'status' => true,
    //             'model' => $model 
    //         ], 200);

    //     } catch (\Throwable $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //    }
    // }

    // public function store(Request $request)
    // {
    //     try {
    //         //Validated
    //         $validateRole = Validator::make($request->all(), 
    //         [
    //             'name' =>'required',
    //             'brand_id' =>'required',
                
    //         ]);

    //         if($validateRole->fails()){
    //             return response()->json([
    //                'status' => false,
    //                'message' => 'validation error',
    //                 'errors' => $validateRole->errors()
    //             ], 401);
    //         }

    //         $checkExist = VehicleModel::where('name',$request->name)->whereNull('deleted_at')->first();

    //         if($checkExist){
    //             return response()->json([
    //                 'status' => false,
    //                 'message' => 'Vehicle Model name already exists',
    //              ], 200);
    //         }

    //         $model = VehicleModel::create([
    //             'name' => $request->name,
    //             'brand_id' => $request->brand_id,
    //             'year_of_made' => $request->year_of_made,
    //             'engine_capacity' => $request->engine_capacity,
    //         ]);

    //         return response()->json([
    //            'status' => true,
    //            'message' => 'Vehicle Model Created Successfully',
    //             'model' => $model
    //         ], 200);

    //     } catch (\Throwable $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //    }
    // }

    // public function show($id)
    // {
    //     try{
    //         $model = VehicleModel::whereNull('deleted_at')->where('id',$id)->first();

    //         return response()->json([
    //             'status' => true,
    //              'model' => $model
    //          ], 200);

    //     }catch (\Throwable $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //     }
    // }


    // public function update(Request $request, $id)
    // {
    //     try {
        
    //         $model = VehicleModel::find($id);
    //         if($model){
    //             $model->update([
    //                 'name' => $request->name,
    //                 'brand_id' => $request->brand_id,
    //                 'year_of_made' => $request->year_of_made,
    //                 'engine_capacity' => $request->engine_capacity
    //             ]);
            
    //             return response()->json([
    //                 'status' => true,
    //                 'message' => 'Vehicle Model Updated Successfully',
    //                  'model' => $model
    //              ], 200);
    //         }else{
    //             return response()->json([
    //               'status' => false,
    //               'message' => 'Vehicle Model Not Found'
    //             ], 404);
    //         }
    
          

    //     } catch (Exception $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //    }
    // }


    // public function destroy($id)
    // {
    //     try {
    //         //Validated
    //         $model = VehicleModel::find($id);
    //         if($model){
    //             $model->delete();
    
    //             return response()->json([
    //                'status' => true,
    //                'message' => 'Vehicle Model Deleted Successfully',
    //             ], 200);
    //         }else{
    //             return response()->json([
    //               'status' => false,
    //               'message' => 'Vehicle Model Not Found'
    //             ], 404);
    //         }
          

    //     } catch (\Throwable $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //    }
    // }
}

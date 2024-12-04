<?php

namespace App\Http\Controllers\Api\VehicleRegistration;

use App\Http\Controllers\Controller;
use App\Models\VehicleBrand;
// use App\Models\VehicleModel;
use Illuminate\Http\Request;

class SecondStepController extends Controller
{
    public function getAllVehicleModels()
    {
    //     try{

    //         $vehicleModel  = VehicleModel::whereNull('deleted_at')->where('disabled',false)->get();

    //         return response()->json([
    //             'status' => true,
    //             'model' => $vehicleModel
    //          ], 200);

             
    //     } catch (\Throwable $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //    }
    }

    public function getAllModelRelatedToBrand(Request $request)
    {
    //     try{
    //         $vehicle_model = VehicleModel::whereNull('deleted_at')
    //         ->where('brand_id',$request->brand_id)
    //         ->where('disabled',false)
    //         ->get();

    //         return response()->json([
    //             'status' => true,
    //             'model' => $vehicle_model
    //          ], 200);

    //     } catch (\Throwable $th) {
    //         return response()->json([
    //            'status' => false,
    //            'message' => $th->getMessage()
    //         ], 500);
    //    }
    }

    public function getAllBrands()
    {
        try{

            $vehicleCtg  = VehicleBrand::whereNull('deleted_at')->get();

            return response()->json([
                'status' => true,
                'brand' =>  $vehicleCtg 
             ], 200);

             
        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }
}

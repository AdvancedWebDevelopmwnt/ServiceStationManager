<?php

namespace App\Http\Controllers\Api\VehicleRegistration;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\VehicleServiceLog;
use Exception;
use Illuminate\Http\Request;

class FirstStepController extends Controller
{
    public function searchVehicleNumber(Request $request)
    {
        try{

            $vehicleData  = Vehicle::where('vehicle_number', '=', $request->vehicle_number)->whereNull('deleted_at')->first();

            if($vehicleData){
                $customer = Customer::where('id', '=', $vehicleData->customer_id)->whereNull('deleted_at')->first();
            }else{
                $customer = null;
            }


            return response()->json([
                'status' => true,
                'vehicle' => $vehicleData,
                'customer'=> $customer

             ], 200);


        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function searchVehicleServiceStatus(Request $request)
    {
        try{

            $vehicleServiceLog  = VehicleServiceLog::where('vehicle_number', '=', $request->vehicle_number)->whereIn('status', ['Ongoing', 'Pending'])->first();

            if($vehicleServiceLog){
                return response()->json([
                    'status' => true,
                    'message' => 'Vehicle in pending or Ongoing status',
                 ], 200);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Vehicle in free status',
                    'vehicle' => null,
                    'customer'=> null,
                 ], 200);
            }

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
        }
    }
}

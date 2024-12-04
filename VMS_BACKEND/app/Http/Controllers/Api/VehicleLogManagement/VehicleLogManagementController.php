<?php

namespace App\Http\Controllers\Api\VehicleLogManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VehicleServiceLog;
use App\Models\Vehicle;
use App\Models\VehicleImages;
use App\Models\VehicleJob;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;




class VehicleLogManagementController extends Controller
{
   public function list()
   {
    try {
        Log :: info('vehicle Log list ');

        $vehicleList = Vehicle::whereNull('vehicles.deleted_at')
        ->leftjoin('vehicle_brands', 'vehicle_brands.id', '=', 'vehicles.brand_id')
        ->leftjoin('customers', 'customers.id', '=', 'vehicles.customer_id')
        ->select(
            'vehicles.*',
            'vehicles.id as vehicle_id',
            'vehicle_brands.name as brand_name',
            'customers.first_name as customer_first_name',
            'customers.last_name as customer_last_name',
            'customers.mobile_number as customer_mobile',
        )
        ->get();

        return response()->json([
            'status' => true,
            'list' => $vehicleList
        ], 200);

    } catch (\Throwable $th) {
        return response()->json([
            'status' => false,
            'message' => $th->getMessage()
        ], 500);
    }
   }

   public function viewRecord($id)
   {
    try {
        Log :: info('view vehicle record ');


        $vehicleNumber = Vehicle::where('id', $id)->value('vehicle_number');

        $vehicleService = VehicleServiceLog::where('vehicle_service_logs.vehicle_number', $vehicleNumber)
        ->join('vehicles','vehicles.vehicle_number','=','vehicle_service_logs.vehicle_number')
        ->leftJoin('vehicle_brands', 'vehicle_brands.id', '=', 'vehicles.brand_id')
        ->leftJoin('customers', 'customers.id', '=', 'vehicles.customer_id')
        ->select(
            'vehicle_service_logs.id as vehicle_service_log_id',
            'vehicle_service_logs.*',
            'vehicles.*',
            'vehicle_brands.name as brand_name',
            'vehicles.id as vehicle_id',
            'vehicle_brands.id as vehicle_brand_id',
            'customers.id as customer_id',
            'customers.first_name as customer_first_name',
            'customers.last_name as customer_last_name',
            'customers.mobile_number as customer_mobile',
            'vehicle_service_logs.created_at as check_in_time',
            'vehicle_service_logs.updated_at as check_out_time'
        )
        ->first();

        if(!$vehicleService){
            return response()->json([
                'status' => false,
                'message' => 'No service log found for this vehicle'
            ], 404);
        }

        $customer = Customer::where('id', $vehicleService->customer_id)->first();

        $jobs = VehicleJob::select('vehicle_jobs.*','jobs.*')
        ->join('jobs','vehicle_jobs.job_id','jobs.id')
        ->where('vehicle_jobs.vehicle_service_log_id', $vehicleService->vehicle_service_log_id)
        ->get();

        $images = VehicleImages::where('vehicle_id',$id)->get();



        return response()->json([
            'status' => true,
            'vehicleRecod' => $vehicleService,
            'customerRecod' => $customer,
            'jobs' => $jobs,
            'images' => $images
        ], 200);

    } catch (\Throwable $th) {
        return response()->json([
            'status' => false,
            'message' => $th->getMessage()
        ], 500);
    }
   }


}

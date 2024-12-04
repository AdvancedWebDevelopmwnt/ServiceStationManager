<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\VehicleImages;
use App\Models\VehicleJob;
use App\Models\VehicleServiceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class VehicleServiceController extends Controller
{
    public function list()
    {
        try {
            Log::info('vehicle service list ');
          
            $vehiclServiceList = VehicleServiceLog::whereDate('vehicle_service_logs.created_at', Carbon::today())
            ->join('vehicles','vehicle_service_logs.vehicle_number','=','vehicles.vehicle_number')
            ->leftJoin('vehicle_brands', 'vehicle_brands.id', '=', 'vehicles.brand_id')
            ->select('vehicles.*','vehicle_brands.name as vehicle_brand','vehicle_service_logs.*')
            ->get();
           
            
            return response()->json([
                'status' => true,
                'list' => $vehiclServiceList
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function ViewRecord($id)
    {
        try {
            Log::info('view vehicle record ');

            $vehicleService = VehicleServiceLog::where('vehicle_service_logs.status','Pending')
            ->whereDate('vehicle_service_logs.created_at', Carbon::today())
            ->join('vehicles','vehicles.vehicle_number','=','vehicle_service_logs.vehicle_number')
            ->leftJoin('vehicle_brands', 'vehicle_brands.id', '=', 'vehicles.brand_id')
            ->leftJoin('customers', 'customers.id', '=', 'vehicles.customer_id')
            ->where('vehicle_service_logs.id', $id)
            ->select('vehicles.*',
            'vehicle_service_logs.id as vehicle_service_log_id',
            'vehicle_brands.name as vehicle_brand',
            'vehicle_service_logs.*',
            'customers.*',
            'vehicles.id as vehicle_id',
            'vehicle_brands.id as vehicle_brand_id',
            'customers.id as customer_id')
            ->first();

            $jobs = VehicleJob::select('vehicle_jobs.*','jobs.*')
            ->join('jobs','vehicle_jobs.job_id','jobs.id')
            ->where('vehicle_jobs.vehicle_service_log_id', $vehicleService->vehicle_service_log_id)
            ->get();



            if($vehicleService){


                $images = VehicleImages::where('vehicle_id',$vehicleService->vehicle_id)->whereDate('created_at', Carbon::today())->get();

            }else{
                $customer = null;
                $images = null;
            }




            return response()->json([
                'status' => true,
                'serviceRecord' => $vehicleService,
                'jobs'=>$jobs,
                'images'=> $images
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}

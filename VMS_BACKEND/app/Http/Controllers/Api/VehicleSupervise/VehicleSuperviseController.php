<?php

namespace App\Http\Controllers\Api\VehicleSupervise;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleImages;
use App\Models\VehicleJob;
use App\Models\VehicleServiceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;





class VehicleSuperviseController extends Controller
{
    public function searchVehicleNumber(Request $request)
    {
        try{
            $vehicle = Vehicle::whereNull('vehicles.deleted_at')
            ->where('vehicles.vehicle_number', $request->vehicle_number)
            ->join('customers', 'customers.id', '=', 'vehicles.customer_id')
            ->join('vehicle_service_logs', 'vehicle_service_logs.vehicle_number', '=', 'vehicles.vehicle_number')
            ->join('vehicle_brands','vehicle_brands.id','vehicles.brand_id')
            ->join('vehicle_models','vehicle_models.id','vehicles.vehicle_model_id')
            // ->where('vehicle_service_logs.status','!=','Completed')
            ->select(
                'vehicles.*',
                'vehicles.id as vehicle_id',
                'vehicle_service_logs.status as vehicle_status',
                'vehicle_service_logs.id as vehicle_service_log_id',
                'customers.*',
                'vehicle_service_logs.*',
                'vehicle_brands.name as brand_name',
                'vehicle_models.name as model_name',
                'customers.type as customer_type',
            )
            ->get();


            $response = [];

            foreach ($vehicle as $Data) {

                $vehicleImages = VehicleImages::where('vehicle_id',$Data->vehicle_id)->get();

                $vehicle_jobs = VehicleJob::where('vehicle_service_log_id',$Data->vehicle_service_log_id)
                ->join('jobs', 'vehicle_jobs.job_id', '=', 'jobs.id')
                ->get();


                $response[] = [
                    'vehicle' => [
                        'id' => $Data->vehicle_id,
                        'brand_id' => $Data->brand_id,
                        'vehicle_number' => $Data->vehicle_number,
                        'vehicle_model_id' =>$Data->vehicle_model_id,
                        'customer_id' => $Data->customer_id,
                        'fuel_type' => $Data->fuel_type,
                        'brand_name'=>$Data->brand_name,
                        'model_name'=>$Data->model_name
                    ],
                    'customer' => [
                        'first_name' => $Data->first_name,
                        'last_name' => $Data->last_name,
                        'mobile_number' => $Data->mobile_number,
                        'email' => $Data->email,
                        'customer_type' => $Data->customer_type,
                        'government_order_form' => $Data->government_order_form
                    ],
                    'job' => $vehicle_jobs,

                    'serviceLog'=>[
                        'vehicle_number' => $Data->vehicle_number,
                        'millage'=>$Data->millage,
                        'oil_litters'=>$Data->oil_litters,
                        'vehicle_status'=>$Data->vehicle_status
                    ],
                    'vehicle_images'=>[
                        'images'=>$vehicleImages
                    ]

                ];
            }

            if (!empty($response)) {
                return response()->json([
                    'status' => true,
                    'data' => $response
                ], 200);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Vehicle number not found'
                ], 200);
            }


        }catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
        }
    }

    public function getVehicleInfo($vehicle_number)
    {

        try{
            $vehicle = Vehicle::where('vehicle_number', $vehicle_number)->first();

            $vehicleServiceLog = VehicleServiceLog::where('vehicle_service_logs.vehicle_number', $vehicle_number)
            ->select(
                'vehicle_service_logs.id as vehicle_service_log_id',
                'vehicle_service_logs.*'
            )
            ->first();

            if(!$vehicleServiceLog){
                return response()->json([
                    'status' => false,
                    'message' => 'No service log found for this vehicle'
                ], 404);
            }

            $vehicleJob = VehicleJob::where('vehicle_service_log_id', $vehicleServiceLog->id)
            ->join('jobs', 'vehicle_jobs.job_id', '=', 'jobs.id')
            ->select(
                'vehicle_jobs.*',
                'jobs.*'
            )
            ->get();

            return response()->json([
                'status' => true,
                'vehicle_service_log' => $vehicleServiceLog,
                'vehicle_jobs' => $vehicleJob
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }

    }

    public function updateJobStatus(Request $request)
{
    try{
        // \Log::info($request);

        //find is there vehicleServiceLog for this vehicle
        $vehicleServiceLog = VehicleServiceLog::where('vehicle_service_logs.vehicle_number', $request->vehicle_number)
        ->first();

        if(!$vehicleServiceLog){
            return response()->json([
                'status' => false,
                'message' => 'No service log found for this vehicle'
            ], 404);
        }

        $vehicleJob = VehicleJob::where('vehicle_service_log_id', $vehicleServiceLog->id)
        ->where('job_id', $request->job_id)
        ->where('status', '!=', 'Rejected')
        ->first();

        if($vehicleJob){
            $vehicleJob->status = $request->status;
            $vehicleJob->save();
        } else {
            $vehicleJob = new VehicleJob();
            $vehicleJob->vehicle_service_log_id = $vehicleServiceLog->id;
            $vehicleJob->job_id = $request->job_id;
            $vehicleJob->status = $request->status;
            $vehicleJob->save();
        }

        return response()->json([
            'status' => true,
            'message' => 'Job status updated successfully'
        ], 200);

    }
    catch (\Throwable $th) {
        return response()->json([
            'status' => false,
            'message' => $th->getMessage()
        ], 500);
    }
}

    //update vehicle status
    public function updateVehicleStatus(Request $request)
    {
        \Log::info($request);
        try{

            //find is there vehicleServiceLog for this vehicle
            $vehicleServiceLog = VehicleServiceLog::where('vehicle_service_logs.vehicle_number', $request->vehicle_number)
            ->first();

            if(!$vehicleServiceLog){
                return response()->json([
                    'status' => false,
                    'message' => 'No service log found for this vehicle'
                ], 404);
            }

            //update vehicle log status
            $vehicleServiceLog = VehicleServiceLog::where('vehicle_service_logs.vehicle_number', $request->vehicle_number)
            ->update([
                'status' => $request->status
            ]);

            if($vehicleServiceLog){
                return response()->json([
                    'status' => true,
                    'message' => 'Vehicle status updated successfully'
                ], 200);
            }else{
                return response()->json([
                    'status' => false,
                    'message' => 'Vehicle status not updated'
                ], 200);
            }

        }
        catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function list()
    {
        // \Log::info('vehicle service list ');
        try {
            $ongoingServiceList = VehicleServiceLog::where('vehicle_service_logs.status','Ongoing')
            ->leftjoin('vehicles','vehicle_service_logs.vehicle_number','=','vehicles.vehicle_number')
            ->leftJoin('vehicle_brands', 'vehicle_brands.id', '=', 'vehicles.brand_id')
            ->leftjoin('customers', 'vehicles.customer_id', '=', 'customers.id')
            ->select('vehicles.*','vehicle_brands.name as vehicle_brand','vehicle_service_logs.*','customers.first_name','customers.last_name','customers.mobile_number')
            ->get();

            $completedServiceList = VehicleServiceLog::where('vehicle_service_logs.status','Completed')
            ->whereDate('vehicle_service_logs.updated_at', Carbon::today())
            ->leftjoin('vehicles','vehicle_service_logs.vehicle_number','=','vehicles.vehicle_number')
            ->leftjoin('customers', 'vehicles.customer_id', '=', 'customers.id')
            ->leftJoin('vehicle_brands', 'vehicle_brands.id', '=', 'vehicles.brand_id')
            ->select('vehicles.*','vehicle_brands.name as vehicle_brand','vehicle_service_logs.*','customers.first_name','customers.last_name','customers.mobile_number' )
            ->get();

            return response()->json([
                'status' => true,
                'ongoing_service_list' => $ongoingServiceList,
                'completed_service_list' => $completedServiceList
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }


}

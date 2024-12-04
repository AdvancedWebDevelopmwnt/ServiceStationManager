<?php

namespace App\Http\Controllers\Api\VehicleRegistration;

use App\Http\Controllers\Controller;
use App\Models\VehicleJob;
use App\Models\VehicleLog;
use App\Models\VehicleServiceLog;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class FinalStepController extends Controller
{
    public function saveJobs(Request $request)
    {

        try{
            $validateRole = Validator::make($request->all(),
            [
                'jobs' =>'required',
                'vehicle_number'=>'required',
            ]);

            Log::info('request data -----');
            Log::info($request->all());

            if($validateRole->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                   'errors' => $validateRole->errors()
                ], 401);
            }

            $jobs = $request->jobs;
            $checkServiceNotCompleted = VehicleServiceLog::where('vehicle_number',$request->vehicle_number)
            ->where('status',['Pending','Ongoing'])
            ->get();

            if(count($checkServiceNotCompleted) > 0){

                return response()->json([
                    'status' => false,
                    'message' => 'Vehicle in pending or Ongoing status',
                 ], 200);
            }else{

                //create service Log
                $logData = VehicleServiceLog::create([
                    'vehicle_number'=>$request->vehicle_number,
                    'millage'=>$request->millage,
                    'oil_litters'=>$request->oil_litters,
                    'status'=>'Pending'

                ]);

                foreach($jobs as $job){
                    VehicleJob::create([
                        'vehicle_service_log_id' =>$logData->id,
                        'job_id'=>$job['id'],
                        'status'=>'Confirmed'
                    ]);
                }


                return response()->json([
                    'status' => true,
                    'message' => 'Vehicle Job Created Successfully',
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

<?php

namespace App\Http\Controllers\Api\BodyWashOnlyRegistration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Job;
use App\Models\Vehicle;
use App\Models\VehicleServiceLog;
use App\Models\VehicleJob;
use App\Models\VehicleImages;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BodyWashOnlyRegistrationController extends Controller
{
    public function getBodyWashJobs(Request $request)
    {
        $jobs = Job::where('name', 'like', '%body%')->get();
        return response()->json([
            'status' => true,
            'message' => 'Body wash jobs',
            'job' => $jobs
        ], 200);
    }

    public function saveOrupdateBodywashOnly(Request $request)
    {
        $validateData = Validator::make($request->all(), [
            'vehicle_number' => 'required',
            'job' => 'required',
        ]);

        if ($validateData->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'validation error',
                'errors' => $validateData->errors()
            ], 401);
        }

        try{
            $vehicle = Vehicle::whereNull('deleted_at')->where('vehicle_number', $request->vehicle_number)->first();
            if (!$vehicle) {
                $vehicle = Vehicle::create([
                    'vehicle_number' => $request->vehicle_number,
                ]);
            }

            //find is there any pending service log for the vehicle
            $vehicleServiceLog = VehicleServiceLog::where('vehicle_number', $request->vehicle_number)->where('status', 'Pending')->first();
            if(!$vehicleServiceLog){
                $vehicleServiceLog = VehicleServiceLog::create([
                    'vehicle_number' => $request->vehicle_number,
                    'status' => 'Pending'
                ]);
            }
            // \Log::info($vehicleServiceLog);

            //check whether this vehicle already has assigned job where job name consists 'body' if not assign new job otherwise update the existing job to new job
            $vehicleJob = VehicleJob::where('vehicle_service_log_id', $vehicleServiceLog->id)->where('status', 'Confirmed')
                ->leftjoin('jobs', 'vehicle_jobs.job_id', '=', 'jobs.id')
                ->where('jobs.name', 'like', '%body%')
                ->select('vehicle_jobs.*')
                ->first();

            if ($vehicleJob) {
                $vehicleJob->job_id = (int)$request->job['id'];
                $vehicleJob->save();
            } else {
                VehicleJob::create([
                    'vehicle_service_log_id' => $vehicleServiceLog->id,
                    'job_id' => $request->job['id'],
                    'status' => 'Confirmed'
                ]);
            }

            $image = $request->file('vehicle_image');

            //check is there image in request
            if ($image) {
                $imageName = time() . '_'. 'vehicle_image' . '.' . $image->extension();
                $image->move(public_path('images'), $imageName);

                $this->saveImagePathToDatabase($imageName, $vehicle->id);
            }


            return response()->json([
                'status' => true,
                'message' => 'Body wash only service created successfully',
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function saveImagePathToDatabase($imageName, $vehicleId)
    {
        try {
            // \Log::info($imageName);
            $vehicleImage = new VehicleImages();
            $vehicleImage->vehicle_id = $vehicleId;
            $vehicleImage->image_path = 'images/' . $imageName;
            $vehicleImage->save();
            // \Log::info($vehicleImage);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    public function list()
    {
        try {
            $jobs = Job::whereNull('deleted_at')->get();

            return response()->json([
               'status' => true,
                'job' => $jobs
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function getMainJobs()
    {
        try {
            $jobs = Job::whereNull('deleted_at')->where('disabled',false)->where('type','main job')->get();

            return response()->json([
               'status' => true,
                'job' => $jobs
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function getSubJobs()
    {
        try {
            $jobs = Job::whereNull('deleted_at')->where('disabled',false)->where('type','sub job')->get();

            return response()->json([
               'status' => true,
                'job' => $jobs
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function getAllJobs()
    {
        try {
            $jobs = Job::whereNull('deleted_at')->where('disabled',false)->get();

            return response()->json([
               'status' => true,
                'job' => $jobs
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
                'type'=>'required',

            ]);

            if($validateRole->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' => $validateRole->errors()
                ], 422);
            }

            $job = Job::create([
                'name' => $request->name,
                'type' => $request->type,

            ]);

            return response()->json([
               'status' => true,
               'message' => 'Job Created Successfully',
                'job' => $job
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
            $jobs = Job::whereNull('deleted_at')->where('id',$id)->first();

            return response()->json([
                'status' => true,
                 'job' => $jobs
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

            $jobs = Job::find($id);
            if($jobs){
                $jobs->update([
                    'name' => $request->name,
                    'type' => $request->type,

                    // 'disabled' =>$request->status
                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Job Updated Successfully',
                     'branch' => $jobs
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Role Not Found'
                ], 400);
            }

        } catch (\Throwable $th) {
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

            $role = Job::find($id);
            if($role){
                $role->delete();

                return response()->json([
                    'status' => true,
                    'message' => 'Job Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                    'status' => false,
                    'message' => 'Job Not Found'
                ], 400);
            }

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }
}

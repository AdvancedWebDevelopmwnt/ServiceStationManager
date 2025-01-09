<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    public function list()
    {
        try {
            $appointments = Appointment::whereNull('deleted_at')->get();

            return response()->json([
                'status' => true,
                'appointments' => $appointments
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
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'appointment_date' => 'required|date',
                'status' => 'required|in:pending,confirmed,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $appointment = Appointment::create([
                'name' => $request->name,
                'appointment_date' => $request->appointment_date,
                'status' => $request->status
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Appointment Created Successfully',
                'appointment' => $appointment
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $appointment = Appointment::find($id);

            if (!$appointment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Appointment Not Found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'appointment' => $appointment
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'appointment_date' => 'sometimes|date',
                'status' => 'sometimes|in:pending,confirmed,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $appointment = Appointment::find($id);

            if (!$appointment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Appointment Not Found'
                ], 404);
            }

            $appointment->update($request->only(['name', 'appointment_date', 'status']));

            return response()->json([
                'status' => true,
                'message' => 'Appointment Updated Successfully',
                'appointment' => $appointment
            ], 200);
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
            $appointment = Appointment::find($id);

            if (!$appointment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Appointment Not Found'
                ], 404);
            }

            $appointment->delete();

            return response()->json([
                'status' => true,
                'message' => 'Appointment Deleted Successfully'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}

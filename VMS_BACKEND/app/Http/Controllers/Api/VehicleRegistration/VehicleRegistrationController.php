<?php

namespace App\Http\Controllers\Api\VehicleRegistration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Vehicle;

class VehicleRegistrationController extends Controller
{


    public function saveCustomerAndVehicleInfo(Request $request)
    {
        $validatedData = $request->validate([
            'customerRecord.first_name' => 'required',
            'customerRecord.last_name' => 'required',
            'customerRecord.mobile_number' => 'required',
            'vehicleRecord.vehicle_number' => 'required',
            'vehicleRecord.vehicle_brand' => 'required',
            'vehicleRecord.vehicle_model' => 'required',
            'vehicleRecord.year_of_made' => 'required',
            'vehicleRecord.fuel_type' => 'required',
            // add other fields here...
        ]);

        
        //check is vehicle number already exists with where deleted_at is null
        $vehicle = Vehicle::where('vehicle_number',$request->vehicleRecord['vehicle_number'])->whereNull('deleted_at')->first();
        if($vehicle){
            return response()->json([
                'status' => false,
                'message' => 'Vehicle Number Already Exists'
            ], 400);
        }

        try{
            $customer = new Customer();
            $customer->first_name = $request->customerRecord['first_name'];
            $customer->last_name = $request->customerRecord['last_name'];
            // $customer->email = $request->customerRecord['email'];
            $customer->mobile_number = $request->customerRecord['mobile_number'];
            $customer->nic = $request->customerRecord['nic'];
            $customer->address = $request->customerRecord['address'];

            // $customer->government_order_form = $request->customerRecord['government_order_form'] == 'Yes'? 1 : 0;
            $customer->save();

            $vehicle = new Vehicle();
            $vehicle->brand_id = $request->vehicleRecord['vehicle_brand'];
            $vehicle->vehicle_number = $request->vehicleRecord['vehicle_number'];
            $vehicle->vehicle_model = $request->vehicleRecord['vehicle_model'];
            $vehicle->engine_capacity = $request->vehicleRecord['engine_capacity'];
            $vehicle->year_of_made = $request->vehicleRecord['year_of_made'];
            $vehicle->customer_id = $customer->id;
            $vehicle->fuel_type = $request->vehicleRecord['fuel_type'];

            $vehicle->save();

            return response()->json([
                'status' => true,
                'message' => 'Customer and Vehicle data saved successfully',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function List()
    {
        try{
            $vehicleDta = Vehicle::whereNull('vehicles.deleted_at')
            ->join('customers','vehicles.customer_id','=','customers.id')
            ->join('vehicle_brands','vehicles.brand_id','=','vehicle_brands.id')
            ->select('vehicles.*',
            'customers.first_name',
            'customers.last_name',
            'customers.nic',
            'customers.address',
            'customers.mobile_number',
            'vehicle_brands.name as brand_name',
            )
            ->get();

            return response()->json([
                'status' => true,
                'vehicleData' =>  $vehicleDta
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
            $vehicleData = Vehicle::whereNull('vehicles.deleted_at')
            ->join('customers','vehicles.customer_id','=','customers.id')
            ->join('vehicle_brands','vehicles.brand_id','=','vehicle_brands.id')
            ->where('vehicles.id',$id)
            ->select('vehicles.*',
            'customers.first_name',
            'customers.last_name',
            'customers.nic',
            'customers.address',
            'customers.mobile_number',
            'vehicle_brands.name as brand_name',
            'vehicle_brands.id as vehicle_brand'
            )
            ->get();

            return response()->json([
                'status' => true,
                 'vehicleData' => $vehicleData
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

            $vehicle = Vehicle::find($id);
            if($vehicle){
                $vehicle->update([
                    'vehicle_number' =>$request->vehicle_number,
                    'brand_id'=>$request->vehicle_brand,
                    'vehicle_model'=>$request->vehicle_model,
                    'engine_capacity'=>$request->engine_capacity,
                    'year_of_made'=>$request->year_of_made,
                    'fuel_type'=>$request->fuel_type

                ]);


                $customer = Customer::find($vehicle->customer_id);
                $customer->update([
                    'first_name' =>$request->first_name,
                    'last_name'=>$request->last_name,
                    'mobile_number'=>$request->mobile_number,
                    'email'=>$request->email,
                    'nic'=>$request->nic,
                    'address'=>$request->address,

                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Vehicle & Customer Updated Successfully',
                     'customer' => $vehicle
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Customer Not Found'
                ], 404);
            }

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }


}

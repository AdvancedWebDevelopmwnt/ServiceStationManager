<?php

namespace App\Http\Controllers\Api\VehicleRegistration;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\VehicleImages;
use App\Models\VehicleServiceLog;
use Illuminate\Http\Request;

class FourthStepController extends Controller
{
    public function saveOrupdateVehicleInfo(Request $request)
    {
        try{


            $vehicle = Vehicle::whereNull('deleted_at')->where('vehicle_number',$request->vehicle_number)->first();
            $customer = Customer::whereNull('deleted_at')->where('mobile_number',$request->mobile_number)->first();
            $serviceLog = VehicleServiceLog::where('vehicle_number',$request->vehicle_number)->first();

            if($vehicle){

                $checkExistingImages = VehicleImages::where('vehicle_id',$vehicle->id)->get();

                if(count($checkExistingImages) > 0){
                    foreach ($checkExistingImages as $existingImage) {

                        $imagePath = public_path($existingImage->image_path);
                        if (file_exists($imagePath)) {
                            unlink($imagePath);
                            $existingImage->delete();
                        }

                    }
                }


                $images = $request->file();

                foreach ($images as $key => $image) {
                    $imageName = time() . '_' . $key . '.' . $image->extension();
                    $image->move(public_path('images'), $imageName);
                    $this->saveImagePathToDatabase($imageName,$vehicle->id);
                }

                if($serviceLog){
                    if($serviceLog->status  == 'Completed'){
                        $serviceLog->status = 'Pending';
                        $serviceLog->save();
                    }
                }




                return response()->json([
                    'status' => true,
                     'message' => 'Customer Exists and update customer data and vehicle images',
                 ], 200);


            }else{

                if($customer){
                    $vehicle = new Vehicle();
                    $vehicle->brand_id = $request->vehicle_brand;
                    $vehicle->vehicle_number = $request->vehicle_number;
                    $vehicle->vehicle_model = $request->vehicle_model;
                    $vehicle->customer_id = $customer->id;
                    $vehicle->remark = $request->remark;
                    $vehicle->fuel_type = $request->fuel_type;
                    $vehicle->year_of_made = $request->year_of_made;
                    $vehicle->engine_capacity = $request->engine_capacity;
                    $vehicle->save();
                }else{
                    $vehicle = new Vehicle();
                    $vehicle->brand_id = $request->vehicle_brand;
                    $vehicle->vehicle_number = $request->vehicle_number;
                    $vehicle->vehicle_model = $request->vehicle_model;
                    $vehicle->remark = $request->remark;
                    $vehicle->fuel_type = $request->fuel_type;
                    $vehicle->year_of_made = $request->year_of_made;
                    $vehicle->engine_capacity = $request->engine_capacity;
                    $vehicle->save();
                }




                $images = $request->file();

                foreach ($images as $key => $image) {
                    $imageName = time() . '_' . $key . '.' . $image->extension();
                    $image->move(public_path('images'), $imageName);
                    $this->saveImagePathToDatabase($imageName,$vehicle->id);
                }

                return response()->json([
                    'status' => true,
                     'message' => 'New Vehicle create with images',
                 ], 200);
            }



        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function saveImagePathToDatabase($imageName,$vehicleId)
    {
        try{
            $vehicle_Images = new VehicleImages();
            $vehicle_Images->vehicle_id = $vehicleId;
            $vehicle_Images->image_path = 'images/' . $imageName;
            $vehicle_Images->save();

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }

    }
}

<?php

namespace App\Http\Controllers\Api\VehicleRegistration;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class ThirdStepController extends Controller
{
    public function saveOrUpdateCustomerInfo(Request $request)
    {
        try{

            $customer = Customer::whereNull('deleted_at')->where('mobile_number',$request->mobile_number)->first();

            if($customer){

                 Customer::whereNull('deleted_at')->where('mobile_number',$request->mobile_number)->update([
                   'first_name'=>$request->first_name,
                   'last_name'=>$request->last_name,
                   'email'=>$request->email,
                   'mobile_number'=>$request->mobile_number,
                   'nic'=>$request->nic,
                   'address'=>$request->address,
                   'type'=>$request->customer_type,
                   'government_order_form'=>$request->government_order_form == 'Yes'? 1 : 0
                 ]);

                return response()->json([
                    'status' => true,
                     'message' => 'Customer Exists and update data',
                 ], 200);
            }else{

                $customer = new Customer();
                $customer->first_name = $request->first_name;
                $customer->last_name = $request->last_name;
                $customer->email = $request->email;
                $customer->mobile_number = $request->mobile_number;
                $customer->nic = $request->nic;
                $customer->address = $request->address;
                $customer->type = $request->customer_type;
                $customer->government_order_form = $request->government_order_form == 'Yes'? 1 : 0;
                $customer->save();

                return response()->json([
                    'status' => true,
                     'message' => 'Customer Not Exists and create new data',
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

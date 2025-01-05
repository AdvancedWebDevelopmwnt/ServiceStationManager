<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function list()
    {
        try {
            $customers = Customer::whereNull('deleted_at')->get();
           
            return response()->json([
               'status' => true,
                'customer' => $customers
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
            $validateCustomer = Validator::make($request->all(), [
                'first_name' =>'required',
                'last_name'=>'required',
                'mobile_number'=>'required|unique:customers,mobile_number',
                'type'=>'required',
                'government_order_form'=>'required',
             
            ]);

            if($validateCustomer->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' =>  $validateCustomer->errors()
                ], 401);
            }

            $customerNicExist = Customer::where('nic',$request->nic)->first();
            if($customerNicExist){
                return response()->json([
                    'status' => true,
                    'message' => 'Customer NIC Already Exisist',
                   
                 ], 200);  
            }


            $customerEmailExist = Customer::where('email',$request->email)->first();
            if($customerEmailExist){
                return response()->json([
                    'status' => true,
                    'message' => 'Customer Email Already Exisist',
                   
                 ], 200);  
            }


            $customer = Customer::create([
                'first_name' =>$request->first_name,
                'last_name'=>$request->last_name,
                'mobile_number'=>$request->mobile_number,
                'email'=>$request->email,
                'nic'=>$request->nic,
                'address'=>$request->address,
                'type'=>$request->type,
                'government_order_form'=>$request->government_order_form == 'yes' ? 1 : 0
            ]);

            return response()->json([
               'status' => true,
               'message' => 'Customer Created Successfully',
                'customer' => $customer
            ], 200);
           
         

        } catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
       }
    }

    public function CustomerRegister(Request $request)
    {
        try {
            //Validated
            $validateCustomer = Validator::make($request->all(), [
                'first_name' =>'required',
                'last_name'=>'required',
                'email'=>'required',
                'username'=>'required',
                'password'=>'required'
             
            ]);

            if($validateCustomer->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' =>  $validateCustomer->errors()
                ], 401);
            }

         


            $customerEmailExist = User::where('email',$request->email)->first();
            if($customerEmailExist){
                return response()->json([
                    'status' => true,
                    'message' => 'Customer Email Already Exisist',
                   
                 ], 200);  
            }

            $customerUsernameExist = User::where('username',$request->username)->first();
            if($customerUsernameExist){
                return response()->json([
                    'status' => true,
                    'message' => 'Customer Username Already Exisist',
                   
                 ], 200);  
            }


            $customer = User::create([
                'first_name' =>$request->first_name,
                'last_name'=>$request->last_name,
                'contact'=>$request->mobile_number,
                'email'=>$request->email,
                'username'=>$request->username,
                'name'=> $request->first_name. " " . $request->last_name,
                'role' => 2,
                'password' => Hash::make($request->password)

            ]);

            return response()->json([
               'status' => true,
               'message' => 'User Account created Successfully',
                'customer' => $customer
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
            $customer = Customer::whereNull('deleted_at')->where('id',$id)->first();

            return response()->json([
                'status' => true,
                 'customer' => $customer
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
        
            $customer = Customer::find($id);
            if($customer){
                $customer->update([
                    'first_name' =>$request->first_name,
                    'last_name'=>$request->last_name,
                    'mobile_number'=>$request->mobile_number,
                    'email'=>$request->email,
                    'nic'=>$request->nic,
                    'address'=>$request->address,
                    'type'=>$request->type,
                    'government_order_form'=>$request->government_order_form == 'yes' ? 1 : 0
                ]);
            
                return response()->json([
                    'status' => true,
                    'message' => 'Customer Updated Successfully',
                     'customer' => $customer
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


    public function destroy($id)
    {
        try {
            //Validated
    
            $customer = Customer::find($id);
            if($customer){
                $customer->delete();
    
                return response()->json([
                    'status' => true,
                    'message' => 'Customer Deleted Successfully',
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

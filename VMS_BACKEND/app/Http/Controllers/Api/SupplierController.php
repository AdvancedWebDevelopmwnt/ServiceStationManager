<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    public function list()
    {
        try {
            $supplier = Supplier::whereNull('deleted_at')->where('disabled',false)->get();
           
            return response()->json([
               'status' => true,
                'supplier' => $supplier
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
                'brand_name' =>'required',
                'contact_no'=>'required',
            ]);

            if($validateRole->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' => $validateRole->errors()
                ], 401);
            }

            $checkExist = Supplier::where('name',$request->name)->whereNull('deleted_at')->first();

            if($checkExist){
                return response()->json([
                    'status' => false,
                    'message' => 'Supplier name already exists',
                 ], 200);
            }

            $category = Supplier::create([
                'name' => $request->name,
                'brand_name'=>$request->brand_name,
                'contact_no'=>$request->contact_no,
                'email'=>$request->email,
                'address'=>$request->address,
                'bank_name'=>$request->bank_name,
                'branch_name'=>$request->branch_name,
                'account_number'=>$request->account_number,
            ]);

            return response()->json([
               'status' => true,
               'message' => 'Supplier Created Successfully',
                'category' => $category
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
            $roles = Supplier::whereNull('deleted_at')->where('id',$id)->first();

            return response()->json([
                'status' => true,
                 'supplier' => $roles
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
        
            $supplier = Supplier::find($id);
            if($supplier){
                $supplier->update([
                    'name' => $request->name,
                    'brand_name'=>$request->brand_name,
                    'contact_no'=>$request->contact_no,
                    'email'=>$request->email,
                    'address'=>$request->address,
                    'bank_name'=>$request->bank_name,
                    'branch_name'=>$request->branch_name,
                    'account_number'=>$request->account_number,
                    // 'disabled' =>$request->disabled
                ]);
            
                return response()->json([
                    'status' => true,
                    'message' => 'Supplier Updated Successfully',
                    'supplier' => $supplier
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Supplier Not Found'
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
            $supplier = Supplier::find($id);
            if($supplier){
                $supplier->delete();
    
                return response()->json([
                   'status' => true,
                   'message' => 'Supplier Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Suppplier Not Found'
                ], 404);
            }
          

        }catch (\Throwable $th) {
            return response()->json([
               'status' => false,
               'message' => $th->getMessage()
            ], 500);
        }
    }
}

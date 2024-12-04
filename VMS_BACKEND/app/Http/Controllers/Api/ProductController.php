<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ProductController extends Controller
{
    public function list()
    {
        try {
            $products = Product::whereNull('deleted_at')->get();

            return response()->json([
               'status' => true,
                'product' => $products
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
            $expireDate = Carbon::parse($request->expire_date)->setTimezone('Asia/Colombo');
            $validateRole = Validator::make($request->all(),
            [
                'name' =>'required',
                'item_code'=>'required',
                'selling_price'=>'required',
                'purchasing_price'=>'required',
            ]);

            if($validateRole->fails()){
                return response()->json([
                   'status' => false,
                   'message' => 'validation error',
                    'errors' => $validateRole->errors()
                ], 422);
            }

            $product = Product::create([
                'name' =>$request->name,
                'item_code'=>$request->item_code,
                'model'=>$request->model,
                'selling_price'=>$request->selling_price,
                'purchasing_price'=>$request->purchasing_price,
                'expire_date' => $expireDate->toDateTimeString(),
            ]);

            if($product){
                Stock::create([
                    'product_id' => $product->id,
                    'qty' => 0,
                    'units' => $request->units,
                    'created_by' => $request->user()->id,
                ]);
            }

            return response()->json([
               'status' => true,
               'message' => 'Product Created Successfully',
                'job' => $product
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
            $product = Product::whereNull('deleted_at')->where('id',$id)->first();

            return response()->json([
                'status' => true,
                 'product' => $product
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
            $expireDate = Carbon::parse($request->expire_date)->setTimezone('Asia/Colombo');
            $product = Product::find($id);
            if($product){
                $product->update([
                    'name' =>$request->name,
                    'item_code'=>$request->item_code,
                    'model'=>$request->model,
                    'selling_price'=>$request->selling_price,
                    'purchasing_price'=>$request->purchasing_price,
                    'expire_date' => $expireDate->toDateTimeString(),
                ]);

                //if procuct updated successfully, update it to existing stock
                // $stock = Stock::where('product_id', $product->id)->first();
                // if($stock){
                //     $stock->units = $request->units;
                //     $stock->save();
                // }

                return response()->json([
                    'status' => true,
                    'message' => 'Product Updated Successfully',
                     'branch' => $product
                 ], 200);
            }else{
                return response()->json([
                  'status' => false,
                  'message' => 'Product Not Found'
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

            $role = Product::find($id);
            if($role){
                $role->delete();

                return response()->json([
                    'status' => true,
                    'message' => 'Product Deleted Successfully',
                ], 200);
            }else{
                return response()->json([
                    'status' => false,
                    'message' => 'Product Not Found'
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

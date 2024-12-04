<?php

namespace App\Http\Controllers\Api\SalesManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Sales;
use App\Models\ProductSaleDetails;
use App\Models\Stock;
use App\Models\StockFlow;
use App\Models\Product;
use App\Models\JobSaleDetails;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class SalesManagementController extends Controller
{
    //
    public function createSales(Request $request)
    {
        DB::beginTransaction();

        try {
            $validator = Validator::make($request->all(), [
                'vehicle_id' => 'required',
                'total_price' => 'required',
                'discount' => 'required',
                'net_price' => 'required',
                'products' => 'required',
            ]);

            Log::info($request->all());
            //validator

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            foreach ($request->products as $product) {
                $validator = Validator::make($product, [
                    'product_id' => 'required',
                    'qty' => 'required',
                    'unit_price' => 'required',
                    'discount' => 'required',
                ]);

                if ($validator->fails()) {
                    return response()->json($validator->errors(), 400);
                }
            }

            $sales = Sales::create([
                'vehicle_id' => $request->vehicle_id,
                'total_price' => $request->total_price,
                //set discount default to 0 if not provided
                'discount' => $request->discount ?? 0,
                'net_price' => $request->net_price,
                'created_by' => $request->user()->id,
            ]);

            Log::info($sales);

            foreach ($request->products as $product) {
                $productData = Product::find($product['product_id']);
                Log::info($productData);
                $stock = Stock::where('product_id', $product['product_id'])->first();

                if ($stock->qty < $product['qty']) {
                    return response()->json(['message' => 'Not enough stock for ' . $productData->name], 400);
                }


                $stock->qty = $stock->qty - $product['qty'];
                $stock->save();

                $stockFlow = StockFlow::create([
                    'stock_id' => $stock->id,
                    'stock_out' => $product['qty'],
                    'vehicle_id' => $request->vehicle_id,
                    'transaction_type' => 'sales',
                    'transaction_id' => $sales->id,
                    'created_by' => $request->user()->id,
                ]);

                Log::info($stockFlow);

                ProductSaleDetails::create([
                    'sale_id' => $sales->id,
                    'product_id' => $product['product_id'],
                    'qty' => $product['qty'],
                    'unit_price' => $product['unit_price'],
                    'discount' => $product['discount'] ?? 0,
                    // 'total_price' => ($product['unit_price'] * $product['qty']) - $product['discount'],
                ]);

                Log::info($product);
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Sales created successfully'
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json([
                'status' => false,
                'message' => 'Failed to create sales'
            ], 500);
        }
    }

    public function createJobSales(Request $request)
    {
        DB::beginTransaction();

        try {
            $validator = Validator::make($request->all(), [
                'vehicle_id' => 'required',
                'total_price' => 'required',
                'discount' => 'required',
                'net_price' => 'required',
                'jobs' => 'required',
            ]);

            Log::info($request->all());
            //validator

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            foreach ($request->jobs as $job) {
                $validator = Validator::make($job, [
                    'job_id' => 'required',
                    'unit_price' => 'required',
                    'discount' => 'required',
                    'total_price' => 'required',
                ]);

                if ($validator->fails()) {
                    return response()->json($validator->errors(), 400);
                }
            }

            $sales = Sales::create([
                'vehicle_id' => $request->vehicle_id,
                'total_price' => $request->total_price,
                'discount' => $request->discount ?? 0,
                'net_price' => $request->net_price,
                'created_by' => $request->user()->id,
            ]);

            Log::info($sales);

            foreach ($request->jobs as $job) {
                // $jobData = Job::find($job['job_id']);
                // Log::info($jobData);

                JobSaleDetails::create([
                    'sale_id' => $sales->id,
                    'job_id' => $job['job_id'],
                    'unit_price' => $job['unit_price'],
                    'discount' => $job['discount'] ?? 0,
                    'total_price' => $job['total_price'],
                ]);

                Log::info($job);
            }



            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Sales created successfully'
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json([
                'status' => false,
                'message' => 'Failed to create sales'
            ], 500);
        }

    }
}

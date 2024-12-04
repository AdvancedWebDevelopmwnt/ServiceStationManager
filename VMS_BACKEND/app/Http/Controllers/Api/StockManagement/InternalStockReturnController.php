<?php

namespace App\Http\Controllers\Api\StockManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Stock;
use App\Models\User;
use App\Models\StockFlow;
use App\Models\Product;
use App\Models\Vehicle;
use App\Models\InternalStockReturn;
use App\Models\InternalStockTaking;
use App\Models\InternalStockTakingDetails;
use App\Models\InternalStockReturnDetails;
use App\Models\Sales;
use App\Models\ProductSaleDetails;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class InternalStockReturnController extends Controller
{
    //
    public function returnStock(Request $request)
    {
        DB::beginTransaction();

        try {
            $validator = Validator::make($request->all(), [
                'vehicle_id' => 'required',
                'returned_by' => 'required',
                'IST_id' => 'required',
                'stockReturnData' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            foreach ($request->stockReturnData as $data) {
                $validator = Validator::make($data, [
                    'product_id' => 'required',
                    'qty' => 'required',
                    'units' => 'required',
                    'usedQty' => 'required',
                ]);

                if ($validator->fails()) {
                    return response()->json($validator->errors(), 400);
                }
            }

            $isr = InternalStockReturn::create([
                'vehicle_id' => $request->vehicle_id,
                'returned_by' => $request->returned_by,
                'created_by' => $request->user()->id,
                'IST_id' => $request->IST_id,
            ]);

            foreach ($request->stockReturnData as $data) {
                InternalStockReturnDetails::create([
                    'ISR_id' => $isr->id,
                    'product_id' => $data['product_id'],
                    'qty' => $data['qty'],
                    'units' => $data['units'],
                ]);

                // $ist = InternalStockTaking::find($request->IST_id);
                // $ist->isCompleted = true;
                Log::info($request->IST_id);
                InternalStockTakingDetails::where('IST_id', $request->IST_id)
                ->where('product_id', $data['product_id'])
                ->update(['isReturned' => true]);


                $stock = Stock::where('product_id', $data['product_id'])
                    ->first();

                if (!$stock) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Stock not found'
                    ], 404);
                }

                $usedQty = $data['usedQty'];
                $stock->qty -= $data['usedQty'];
                $stock->resQty -= $data['qty']+ $data['usedQty'];

                $stock->save();

                StockFlow::create([
                    'stock_id' => $stock->id,
                    'stock_in' => $data['qty'],
                    'reason' => $data['reason'],
                    'vehicle_id' => $request->vehicle_id,
                    'transaction_type' => 'internal_stock_return',
                    'transaction_id' => $isr->id,
                    'created_by' => $request->user()->id,
                ]);

                $sales = Sales::where('vehicle_id', $request->vehicle_id)->first();
                $product = Product::find($data['product_id']);


                //all sales data
                Log::info($request->vehicle_id);
                //total price
                Log::info($usedQty * $product->selling_price);
                //net price
                Log::info($usedQty * $product->selling_price);
                //created by
                Log::info($request->user()->id);


                $sales = Sales::create([
                    'vehicle_id' => $request->vehicle_id,
                    'total_price' => 0,
                    'net_price' => 0,
                    'created_by' => $request->user()->id,
                ]);

                $sales->total_price += $usedQty * $product->selling_price;
                $sales->net_price += $usedQty * $product->selling_price;

                $sales->save();

                ProductSaleDetails::create([
                    'sale_id' => $sales->id,
                    'product_id' => $data['product_id'],
                    'qty' => $usedQty,
                    'unit_price' => $product->selling_price,
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Stock returned successfully'
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json([
                'status' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }
}

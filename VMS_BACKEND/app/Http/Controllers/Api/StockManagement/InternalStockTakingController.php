<?php

namespace App\Http\Controllers\Api\StockManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Stock;
use App\Models\User;
use App\Models\StockFlow;
use App\Models\Product;
use App\Models\InternalStockTaking;
use App\Models\InternalStockTakingDetails;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class InternalStockTakingController extends Controller
{
    //
    public function takeStock(Request $request)
    {
        DB::beginTransaction();

        try {
            log::info($request->all());
            $validator = Validator::make($request->all(), [
                'vehicle_id' => 'required',
                'taken_by' => 'required',
                'stockTakingData' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            foreach ($request->stockTakingData as $data) {
                $validator = Validator::make($data, [
                    'product_id' => 'required',
                    'qty' => 'required',
                    'units' => 'required',
                ]);

                if ($validator->fails()) {
                    return response()->json($validator->errors(), 400);
                }
            }

            $ist = InternalStockTaking::create([
                'vehicle_id' => $request->vehicle_id,
                'taken_by' => $request->taken_by,
                'created_by' => $request->user()->id,
                'isCompleted' => false,
            ]);

            Log::info($ist);

            foreach ($request->stockTakingData as $data) {
                InternalStockTakingDetails::create([
                    'IST_id' => $ist->id,
                    'product_id' => $data['product_id'],
                    'qty' => $data['qty'],
                    'units' => $data['units'],
                    'isReturned' => false,
                ]);

                $stock = Stock::where('product_id', $data['product_id'])
                    ->where('qty', '>', 0)
                    ->first();

                log::info($stock);

                if (!$stock || $stock->qty < $data['qty']) {
                    return response()->json(['message' => 'Not enough stock'], 400);
                }

                $stock->resQty+= $data['qty'];
                $stock->save();

                StockFlow::create([
                    'stock_id' => $stock->id,
                    'stock_out' => $data['qty'],
                    'reason' => $data['reason'],
                    'vehicle_id' => $request->vehicle_id,
                    'transaction_type' => 'internal_stock_taking',
                    'transaction_id' => $ist->id,
                    'created_by' => $request->user()->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Stock taken successfully'
            ], 200);
        } catch (Exception $e) {
            DB::rollback();

            return response()->json([
                'status' => false,
                'message' => 'Failed to take stock: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getStock()
    {
        try {
            $stock = Stock::where('qty', '>', 0)
            ->join('products', 'products.id','=','stocks.product_id')
            ->select(
                'stocks.*',
                'products.name as product_name',
                'products.id as product_id'
            )
            ->get();

            return response()->json([
                'status' => true,
                'stock' => $stock
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }

    }

    // public function getAllInternalStockTaking()
    // {
    //     try {
    //         $ist = InternalStockTaking::where('isCompleted', false)
    //         ->join('vehicles', 'vehicles.id', '=', 'internal_stock_takings.vehicle_id')
    //         ->join('internal_stock_taking_details', 'internal_stock_taking_details.IST_id', '=', 'internal_stock_takings.id')
    //         ->join('products', 'products.id', '=', 'internal_stock_taking_details.product_id')
    //         ->join('stocks', 'stocks.product_id', '=', 'products.id')
    //         ->select(
    //             'internal_stock_takings.*',
    //             'internal_stock_takings.id as IST_id',
    //             'internal_stock_taking_details.qty as qty',
    //             'vehicles.vehicle_number as vehicle_number',
    //             'vehicles.id as vehicle_id',
    //             'products.name as product_name',
    //             'products.id as product_id',
    //             'stocks.units as units'
    //         )
    //         ->get();

    //         return response()->json([
    //             'status' => true,
    //             'ist' => $ist
    //         ], 200);

    //     } catch (\Throwable $th) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => $th->getMessage()
    //         ], 500);
    //     }
    // }

    public function getAllInternalStockTaking()
    {
        try {
            $ist = InternalStockTaking::where('isCompleted', false)
            ->join('vehicles', 'vehicles.id', '=', 'internal_stock_takings.vehicle_id')
            ->join('internal_stock_taking_details', function ($join) {
                $join->on('internal_stock_taking_details.IST_id', '=', 'internal_stock_takings.id')
                    ->where('internal_stock_taking_details.isReturned', false);
            })
            ->join('products', 'products.id', '=', 'internal_stock_taking_details.product_id')
            ->join('stocks', 'stocks.product_id', '=', 'products.id')
            ->select(
                'internal_stock_takings.*',
                'internal_stock_takings.id as IST_id',
                'internal_stock_taking_details.qty as qty',
                'vehicles.vehicle_number as vehicle_number',
                'vehicles.id as vehicle_id',
                'products.name as product_name',
                'products.id as product_id',
                'stocks.units as units'
            )
            ->get();

            return response()->json([
                'status' => true,
                'ist' => $ist
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

}

<?php

namespace App\Http\Controllers\Api\StockManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Stock;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class StockManagementController extends Controller
{
    public function list()
    {
        try {
            Log :: info('stock list ');

            $stockList = Stock::leftjoin('products', 'products.id', '=', 'stocks.product_id')
            ->leftjoin('users', 'users.id', '=', 'stocks.created_by')
            ->select(
                'stocks.*',
                'stocks.id as stock_id',
                'products.name as product_name',
                'users.name as created_by'
            )
            ->get();

            return response()->json([
                'status' => true,
                'list' => $stockList
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
        \Log::info($request->all());
        try {

            $validator = Validator::make($request->all(), [
                'product_id' => 'required',
                'qty' => 'required',
                'units' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            $stock = Stock::where('product_id', $request->product_id)->first();
            if ($stock) {
                $stock->qty = $stock->qty + $request->qty;
                $stock->save();
            } else {
                $stock = new Stock();
                $stock->product_id = $request->product_id;
                $stock->qty = $request->qty;
                $stock->units = $request->units;
                $stock->created_by = $request->user()->id;
                $stock->save();
            }

            return response()->json([
                'status' => true,
                'message' => 'Stock created successfully'
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function getAllStocks()
    {
        try{
            $stock = Stock::leftjoin('products', 'products.id', '=', 'stocks.product_id')
            ->leftjoin('users', 'users.id', '=', 'stocks.created_by')
            ->select(
                'stocks.*',
                'stocks.id as stock_id',
                'products.name as product_name',
                'item_code as item_code',
                'products.selling_price as selling_price',
                'products.purchasing_price as purchase_price',
                'users.name as created_by'
            )
            ->get();

            return response()->json([
                'status' => true,
                'stock_list' => $stock
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);

        }

    }

    public function getAllProducts()
    {
        try{
            $stock = Stock::where('qty', '>', 0)
            ->leftjoin('products', 'products.id', '=', 'stocks.product_id')
            ->select(
                'products.*',
                'stocks.qty as qty'
            )
            ->get();

            return response()->json([
                'status' => true,
                'product' => $stock
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);

        }

    }
}

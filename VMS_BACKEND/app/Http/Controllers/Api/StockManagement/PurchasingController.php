<?php

namespace App\Http\Controllers\Api\StockManagement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Stock;
use App\Models\Product;
use App\Models\User;
use App\Models\Supplier;
use App\Models\PurchasingBrief;
use App\Models\PurchasingDetails;
use App\Models\StockFlow;
use App\Models\Sales;
use App\Models\SystemGrnNumber;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;


class PurchasingController extends Controller
{
    public function store(Request $request)
    {

        DB::beginTransaction();

        try {
            Log::info($request->all());

            $validateRole = Validator::make($request->all(), [
                'supplier_id' => 'required',
                'bill_total_amount' => 'required',
                'bill_total_discount' => 'required',
                'manual_GRN_number' => 'required',
                'products' => 'required',
            ]);

            if ($validateRole->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateRole->errors()
                ], 401);
            }

            $systemGrnNumber = SystemGrnNumber::first();
            if(!$systemGrnNumber){
                $systemGrnNumber = new SystemGrnNumber([
                    'system_GRN_number' => 'VMS-00000',
                ]);
                $systemGrnNumber->save();
            }

            $number = explode('-', $systemGrnNumber->system_GRN_number);
            $number = $number[1] + 1;
            $systemGrnNumber->system_GRN_number = 'VMS-' . str_pad($number, 5, '0', STR_PAD_LEFT);
            $systemGrnNumber->save();

            $purchasingBrief = new PurchasingBrief([
                'supplier_id' => $request->supplier_id,
                'bill_total_amount' => $request->bill_total_amount,
                'bill_total_discount' => $request->bill_total_discount,
                'manual_GRN_number' => $request->manual_GRN_number,
                'system_GRN_number' => $systemGrnNumber->system_GRN_number,
            ]);
            $purchasingBrief->save();

            Log::info($purchasingBrief->id);

            foreach ($request->products as $productData) {
                $purchasingDetail = new PurchasingDetails([
                    'purchasing_brief_id' => $purchasingBrief->id,
                    'product_id' => $productData['id'],
                    'qty' => $productData['qty'],
                    'units' => $productData['units'],
                    'unit_price' => $productData['unit_price'],
                    'discount_percentage' => $productData['discount_percentage'],
                    'total_price' => $productData['total_price'],
                    'expire_date' => $productData['expire_date'],
                ]);
                $purchasingDetail->save();

                $stock = Stock::where('product_id', $productData['id'])->first();

                if ($stock) {
                    $stock->qty = $stock->qty + $productData['qty'];
                    $stock->units = $productData['units'];
                    $stock->created_by = $request->user()->id;
                    $stock->save();
                } else {
                    $stock = new Stock([
                        'product_id' => $productData['id'],
                        'qty' => $productData['qty'],
                        'units' => $productData['units'],
                        'created_by' => $request->user()->id,
                    ]);
                    $stock->save();
                }

                $stockFlow = new StockFlow([
                    'stock_id' => $stock->id,
                    'stock_in' => $productData['qty'],
                    'reason' => 'Purchased',
                    'transaction_type' => 'purchasing',
                    'transaction_id' => $purchasingBrief->id,
                    'created_by' => $request->user()->id,

                ]);
                $stockFlow->save();
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Purchasing recorded successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Failed to record purchasing: ' . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Failed to record purchasing: ' . $e->getMessage()
            ], 500);
        }
    }
}

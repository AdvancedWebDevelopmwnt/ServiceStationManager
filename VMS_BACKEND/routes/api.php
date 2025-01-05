<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\JobController;

use App\Http\Controllers\Api\VehicleRegistration\FirstStepController;
use App\Http\Controllers\Api\VehicleRegistration\FourthStepController;
use App\Http\Controllers\Api\VehicleRegistration\SecondStepController;
use App\Http\Controllers\Api\VehicleRegistration\ThirdStepController;
use App\Http\Controllers\Api\VehicleRegistration\FinalStepController;

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehicleBrandController;
// use App\Http\Controllers\Api\VehicleModelController;
use App\Http\Controllers\Api\VehicleServiceController;
use App\Http\Controllers\Api\VehicleSupervise\VehicleSuperviseController;
use App\Http\Controllers\Api\VehicleRegistration\VehicleRegistrationController;///////////

use App\Http\Controllers\Api\StockManagement\StockManagementController;
use App\Http\Controllers\Api\StockManagement\PurchasingController;
use App\Http\Controllers\Api\StockManagement\InternalStockTakingController;
use App\Http\Controllers\Api\StockManagement\InternalStockReturnController;

use App\Http\Controllers\Api\SalesManagement\SalesManagementController;

use App\Http\Controllers\Api\BodyWashOnlyRegistration\BodyWashOnlyRegistrationController;

use App\Http\Controllers\Api\VehicleLogManagement\VehicleLogManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/checkuser', function (Request $request) {
    return $request->user();
});



Route::post('/login',[AuthController::class,'loginUser']);

Route::post('/customer-register',[CustomerController::class,'CustomerRegister']);


Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout',[AuthController::class,'logout']);

    Route::group(['prefix'=>'role'], function(){
        Route::get('/',[RoleController::class,'list']);
        Route::post('/',[RoleController::class,'store']);
        Route::post('/{id}',[RoleController::class,'update']);
        Route::delete('/{id}',[RoleController::class,'destroy']);
        Route::get('/show/{id}',[RoleController::class,'show']);
    });

    Route::group(['prefix'=>'branch'], function(){
        Route::get('/',[BranchController::class,'list']);
        Route::post('/',[BranchController::class,'store']);
        Route::post('/{id}',[BranchController::class,'update']);
        Route::delete('/{id}',[BranchController::class,'destroy']);
    });


    Route::group(['prefix'=>'user'], function(){
        Route::get('/getAllPermissions',[UserController::class,'getAllPermissions']);
       Route::get('/{id}',[UserController::class,'getUserData']);
        Route::get('/',[UserController::class,'list']);
        Route::put('/{id}',[UserController::class,'update']);
        Route::post('/',[UserController::class,'store']);
        Route::delete('/{id}',[UserController::class,'destroy']);
        Route::post('/resetpassword/{id}',[UserController::class,'updatePassword']);
    });

    Route::group(['prefix'=>'brand'], function(){
        Route::get('/',[VehicleBrandController::class,'list']);
        Route::post('/',[VehicleBrandController::class,'store']);
        Route::post('/{id}',[VehicleBrandController::class,'update']);
        Route::delete('/{id}',[VehicleBrandController::class,'destroy']);
        Route::get('/show/{id}',[VehicleBrandController::class,'show']);
    });

    Route::group(['prefix'=>'register'], function(){
        Route::post('/vehicleRegistration',[VehicleRegistrationController::class,'saveCustomerAndVehicleInfo']);
        Route::get('/vehicleList',[VehicleRegistrationController::class,'list']);
        Route::get('/show/{id}',[VehicleRegistrationController::class,'show']);
        Route::post('/{id}',[VehicleRegistrationController::class,'update']);
    });

    Route::group(['prefix'=>'bodyWash'], function(){
        Route::get('/getBodyWashJobs',[BodyWashOnlyRegistrationController::class,'getBodyWashJobs']);
        Route::post('/saveOrupdateBodywashOnly',[BodyWashOnlyRegistrationController::class,'saveOrupdateBodywashOnly']);
    });

    Route::group(['prefix'=>'jobs'], function(){
        Route::get('/',[JobController::class,'list']);
        Route::post('/',[JobController::class,'store']);
        Route::post('/{id}',[JobController::class,'update']);
        Route::delete('/{id}',[JobController::class,'destroy']);
        Route::get('/show/{id}',[JobController::class,'show']);
        Route::get('/getMainJobs',[JobController::class,'getMainJobs']);
        Route::get('/getSubJobs',[JobController::class,'getSubJobs']);
        Route::get('/getAllJobs',[JobController::class,'getAllJobs']);
    });

    Route::group(['prefix'=>'product'], function(){
        Route::get('/',[ProductController::class,'list']);
        Route::post('/',[ProductController::class,'store']);
        Route::post('/{id}',[ProductController::class,'update']);
        Route::delete('/{id}',[ProductController::class,'destroy']);
        Route::get('/show/{id}',[ProductController::class,'show']);
    });

    Route::group(['prefix'=>'customer'], function(){
        Route::get('/',[CustomerController::class,'list']);
        Route::post('/',[CustomerController::class,'store']);
        Route::post('/{id}',[CustomerController::class,'update']);
        Route::delete('/{id}',[CustomerController::class,'destroy']);
        Route::get('/show/{id}',[CustomerController::class,'show']);
    });

    Route::group(['prefix'=>'supplier'], function(){
        Route::get('/',[SupplierController::class,'list']);
        Route::post('/',[SupplierController::class,'store']);
        Route::post('/{id}',[SupplierController::class,'update']);
        Route::delete('/{id}',[SupplierController::class,'destroy']);
        Route::get('/show/{id}',[SupplierController::class,'show']);
    });

    Route::group(['prefix'=>'vehicleService'], function(){
        Route::get('/',[VehicleServiceController::class,'list']);
        Route::get('/show/{id}',[VehicleServiceController::class,'ViewRecord']);

    });

    Route::group(['prefix'=>'stock'], function(){
        Route::get('/',[StockManagementController::class,'list']);
        Route::get('/getAllProducts',[StockManagementController::class,'getAllProducts']);
        Route::post('/',[StockManagementController::class,'store']);
        Route::get('/getAllStocks',[StockManagementController::class,'getAllStocks']);

        Route::post('/purchasing',[PurchasingController::class,'store']);
        Route::post('/internalStockTaking',[InternalStockTakingController::class,'takeStock']);
        Route::get('/internalStock/getAllInternalStockTaking',[InternalStockTakingController::class,'getAllInternalStockTaking']);
        Route::post('/internalStockReturn',[InternalStockReturnController::class,'returnStock']);
        Route::get('/internalStock/getStock',[InternalStockTakingController::class,'getStock']);

        // Route::get('/show/{id}',[StockManagementController::class,'viewRecord']);
        // Route::post('/{id}',[StockManagementController::class,'update']);
    });

    //sales management routes
    Route::group(['prefix'=>'sales'], function(){
        Route::post('/add',[SalesManagementController::class,'createSales']);
        Route::post('/createJobSales',[SalesManagementController::class,'createJobSales']);
    });


    //service portal routes
    Route::group(['prefix'=>'servicePortal'], function(){
        Route::post('/searchVehicleNumber',[FirstStepController::class,'searchVehicleNumber']);
        Route::post('/searchVehicleServiceStatus',[FirstStepController::class,'searchVehicleServiceStatus']);
        // Route::get('/getAllModels',[SecondStepController::class,'getAllVehicleModels']);
        Route::get('/getAllBrands',[SecondStepController::class,'getAllBrands']);
        Route::post('/saveOrUpdateCustomerInfo',[ThirdStepController::class,'saveOrUpdateCustomerInfo']);
        Route::post('/saveOrupdateVehicleInfo',[FourthStepController::class,'saveOrupdateVehicleInfo']);
        Route::post('/saveJobs',[FinalStepController::class,'saveJobs']);
        // Route::post('/getAllModelRelatedToBrand',[SecondStepController::class,'getAllModelRelatedToBrand']);

        //vehicle supervise routes
        Route::get('/getVehicleInfo/{vehicle_number}',[VehicleSuperviseController::class,'getVehicleInfo']);
        Route::post('/updateJobStatus',[VehicleSuperviseController::class,'updateJobStatus']);
        Route::post('/updateVehicleStatus',[VehicleSuperviseController::class,'updateVehicleStatus']);
        Route::get('/getOngoingVehicleService',[VehicleSuperviseController::class,'list']);

        //vehicle registration routes
        Route::post('/saveCustomerAndVehicleInfo',[VehicleRegistrationController::class,'saveCustomerAndVehicleInfo']);

    });

    Route::group(['prefix'=>'vehicleLog'], function(){
        Log::alert("message");
        Route::get('/',[VehicleLogManagementController::class,'list']);
        Route::get('/show/{id}',[VehicleLogManagementController::class,'viewRecord']);
        // Route::post('/{id}',[VehicleSuperviseController::class,'update']);
    });




});


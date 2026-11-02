<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\LandingPhotoController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/admin/login', [AdminDashboardController::class, 'loginForm'])->name('admin.login');
    Route::post('/admin/login', [AdminDashboardController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('admin.login.submit');
});

Route::prefix('admin')->name('admin.')->middleware('admin.page')->group(function (): void {
    Route::get('/', [AdminDashboardController::class, 'dashboard'])->name('dashboard');
    Route::post('/logout', [AdminDashboardController::class, 'logout'])->name('logout');
    Route::post('/students', [AdminDashboardController::class, 'storeStudent'])->name('students.store');
    Route::put('/students/{student}', [AdminDashboardController::class, 'updateStudent'])->name('students.update');
    Route::delete('/students/{student}', [AdminDashboardController::class, 'destroyStudent'])->name('students.destroy');
    Route::post('/photos', [AdminDashboardController::class, 'storePhoto'])->name('photos.store');
    Route::delete('/photos/{landingPhoto}', [AdminDashboardController::class, 'destroyPhoto'])->name('photos.destroy');
});

Route::prefix('api/admin')->group(function (): void {
    Route::get('/csrf', [AdminAuthController::class, 'csrf']);
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('admin')->group(function (): void {
        Route::get('/session', fn () => response()->json(['authenticated' => true]));
        Route::get('/students', [StudentController::class, 'adminIndex']);
        Route::get('/landing-photos', [LandingPhotoController::class, 'adminIndex']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::put('/students/{student}', [StudentController::class, 'update']);
        Route::post('/students/{student}/photo', [StudentController::class, 'uploadPhoto']);
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);
        Route::post('/landing-photos', [LandingPhotoController::class, 'store']);
        Route::delete('/landing-photos/{landingPhoto}', [LandingPhotoController::class, 'destroy']);
    });
});

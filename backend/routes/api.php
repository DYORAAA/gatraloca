<?php

use App\Http\Controllers\Api\MajorController;
use App\Http\Controllers\Api\LandingPhotoController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/students', [StudentController::class, 'index']);
Route::get('/students/{student}', [StudentController::class, 'show']);
Route::get('/students/{student}/photo', [StudentController::class, 'showPhoto']);
Route::get('/landing-photos', [LandingPhotoController::class, 'index']);
Route::get('/landing-photos/{landingPhoto}/photo', [LandingPhotoController::class, 'showPhoto']);
Route::get('/majors', [MajorController::class, 'index']);

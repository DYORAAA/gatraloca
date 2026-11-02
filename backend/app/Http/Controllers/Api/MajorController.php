<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;

class MajorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Student::query()->select('major')->distinct()->orderBy('major')->pluck('major'));
    }
}

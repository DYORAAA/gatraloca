<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuthController extends Controller
{
    public function csrf(Request $request): JsonResponse
    {
        return response()->json(['token' => $request->session()->token()]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string'],
        ]);
        $adminUsername = (string) config('admin.username');
        $adminPassword = (string) config('admin.password');

        if ($adminUsername === '' || $adminPassword === '') {
            return response()->json(['message' => 'Konfigurasi akun admin belum diatur di backend.'], 503);
        }

        if (!hash_equals($adminUsername, $credentials['username']) || !hash_equals($adminPassword, $credentials['password'])) {
            return response()->json(['message' => 'Username atau password admin salah.'], 401);
        }

        $request->session()->regenerate();
        $request->session()->put('admin_authenticated', true);

        return response()->json(['authenticated' => true]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['authenticated' => false]);
    }
}

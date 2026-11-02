<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LandingPhotoController extends Controller
{
    private const SECTIONS = ['major', 'film', 'flashmob'];

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'section' => ['required', Rule::in(self::SECTIONS)],
            'group' => ['nullable', 'string', 'max:50'],
        ]);
        $photos = LandingPhoto::query()
            ->where('section', $filters['section'])
            ->when($request->filled('group'), fn ($query) => $query->where('group_name', $filters['group']))
            ->orderBy('id')
            ->get()
            ->makeHidden(['photo_path']);

        return response()->json($photos);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json(LandingPhoto::query()->orderBy('id', 'desc')->get());
    }

    public function showPhoto(LandingPhoto $landingPhoto): StreamedResponse
    {
        abort_unless(Storage::disk('public')->exists($landingPhoto->photo_path), 404);

        return Storage::disk('public')->response($landingPhoto->photo_path);
    }

    public function store(Request $request): JsonResponse
    {
        $section = $request->input('section');
        $data = $request->validate([
            'section' => ['required', Rule::in(self::SECTIONS)],
            'group_name' => [$section === 'major' ? 'required' : 'nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:150'],
            'photo' => ['required', 'image', 'max:5120'],
        ]);
        $photoPath = $request->file('photo')->store('landing', 'public');
        if ($photoPath === false) {
            return response()->json(['message' => 'Foto gagal disimpan. Silakan coba lagi.'], 500);
        }

        $data['photo_path'] = $photoPath;
        unset($data['photo']);
        if ($data['section'] !== 'major') $data['group_name'] = null;

        return response()->json(LandingPhoto::create($data), 201);
    }

    public function destroy(LandingPhoto $landingPhoto): JsonResponse
    {
        if (!Storage::disk('public')->delete($landingPhoto->photo_path)) {
            return response()->json(['message' => 'Foto gagal dihapus. Data tidak diubah.'], 500);
        }
        $landingPhoto->delete();

        return response()->json(null, 204);
    }
}

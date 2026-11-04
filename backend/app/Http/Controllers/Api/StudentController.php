<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $students = Student::query()
            ->when($request->filled('major'), fn ($query) => $query->where('major', $request->input('major')))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = '%'.$request->input('search').'%';
                $query->where(fn ($query) => $query
                    ->where('name', 'like', $search)
                    ->orWhere('nisn', 'like', $search)
                    ->orWhere('major', 'like', $search)
                    ->orWhere('kelas', 'like', $search));
            })
            ->orderBy('name')->paginate(min(max($request->integer('per_page', 24), 1), 100));

        $data = collect($students->items())
            ->map(fn (Student $student) => $student->makeHidden(['nisn', 'photo_path']));

        return response()->json(['data' => $data, 'total' => $students->total(), 'current_page' => $students->currentPage(), 'last_page' => $students->lastPage(), 'per_page' => $students->perPage()]);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json($student->makeHidden(['nisn', 'photo_path']));
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $students = Student::query()
            ->orderBy('name')
            ->paginate(min(max($request->integer('per_page', 100), 1), 100));

        return response()->json(['data' => $students->items(), 'total' => $students->total(), 'current_page' => $students->currentPage(), 'last_page' => $students->lastPage(), 'per_page' => $students->perPage()]);
    }

    public function showPhoto(Student $student): StreamedResponse
    {
        abort_unless($student->photo_path && Storage::disk('public')->exists($student->photo_path), 404);

        return Storage::disk('public')->response($student->photo_path);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'], 'nisn' => ['required', 'string', 'max:20', 'unique:students,nisn'],
            'major' => ['required', 'string', 'max:50'], 'kelas' => ['nullable', 'string', 'max:50'],
            'quote' => ['nullable', 'string', 'max:500'], 'photo' => ['nullable', 'image', 'max:5120'],
        ]);
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('students', 'public');
            if ($photoPath === false) {
                return response()->json(['message' => 'Foto gagal disimpan. Silakan coba lagi.'], 500);
            }
            $data['photo_path'] = $photoPath;
        }
        unset($data['photo']);

        return response()->json(Student::create($data), 201);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'nisn' => ['required', 'string', 'max:20', Rule::unique('students', 'nisn')->ignore($student->id)],
            'major' => ['required', 'string', 'max:50'],
            'kelas' => ['nullable', 'string', 'max:50'],
            'quote' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            $newPhotoPath = $request->file('photo')->store('students', 'public');
            if ($newPhotoPath === false) {
                return response()->json(['message' => 'Foto gagal disimpan. Data siswa tidak diubah.'], 500);
            }
            if ($student->photo_path) Storage::disk('public')->delete($student->photo_path);
            $data['photo_path'] = $newPhotoPath;
        }
        unset($data['photo']);
        $student->update($data);

        return response()->json($student->fresh());
    }

    public function uploadPhoto(Request $request, Student $student): JsonResponse
    {
        $request->validate(['photo' => ['required', 'image', 'max:5120']]);
        $newPhotoPath = $request->file('photo')->store('students', 'public');
        if ($newPhotoPath === false) {
            return response()->json(['message' => 'Foto gagal disimpan. Foto lama tetap digunakan.'], 500);
        }
        if ($student->photo_path) Storage::disk('public')->delete($student->photo_path);
        $student->update(['photo_path' => $newPhotoPath]);

        return response()->json($student->fresh());
    }

    public function destroy(Student $student): JsonResponse
    {
        if ($student->photo_path) Storage::disk('public')->delete($student->photo_path);
        $student->delete();

        return response()->json(null, 204);
    }
}

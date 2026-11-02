<?php

namespace App\Http\Controllers;

use App\Models\LandingPhoto;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class AdminDashboardController extends Controller
{
    public function loginForm(Request $request): View|RedirectResponse
    {
        if ($request->session()->get('admin_authenticated', false)) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login', [
            'configured' => filled(config('admin.username')) && filled(config('admin.password')),
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string'],
        ]);
        $adminUsername = (string) config('admin.username');
        $adminPassword = (string) config('admin.password');

        if ($adminUsername === '' || $adminPassword === '') {
            return back()->withInput($request->only('username'))->withErrors([
                'username' => 'Akun admin belum dikonfigurasi. Atur ADMIN_USERNAME dan ADMIN_PASSWORD di backend.',
            ]);
        }

        if (!hash_equals($adminUsername, $credentials['username']) || !hash_equals($adminPassword, $credentials['password'])) {
            return back()->withInput($request->only('username'))->withErrors([
                'username' => 'Username atau password admin salah.',
            ]);
        }

        $request->session()->regenerate();
        $request->session()->put('admin_authenticated', true);

        return redirect()->route('admin.dashboard')->with('status', 'Berhasil masuk ke dashboard.');
    }

    public function dashboard(Request $request): View
    {
        $students = Student::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $term = '%'.$request->string('search')->toString().'%';
                $query->where(fn ($query) => $query
                    ->where('name', 'like', $term)
                    ->orWhere('nisn', 'like', $term)
                    ->orWhere('major', 'like', $term)
                    ->orWhere('kelas', 'like', $term));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $photos = LandingPhoto::query()->orderByDesc('id')->get();

        return view('admin.dashboard', [
            'students' => $students,
            'photos' => $photos,
            'search' => $request->string('search')->toString(),
            'studentCount' => Student::query()->count(),
            'photoCount' => $photos->count(),
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('status', 'Anda sudah keluar dari dashboard.');
    }

    public function storeStudent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'nisn' => ['required', 'string', 'max:20', 'unique:students,nisn'],
            'major' => ['required', 'string', 'max:50'],
            'kelas' => ['nullable', 'string', 'max:50'],
            'quote' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('students', 'public');
            if ($photoPath === false) {
                return back()->withInput()->withErrors(['photo' => 'Foto gagal disimpan. Silakan coba lagi.']);
            }
            $data['photo_path'] = $photoPath;
        }
        unset($data['photo']);

        try {
            Student::create($data);
        } catch (\Throwable $exception) {
            if (!empty($data['photo_path'])) Storage::disk('public')->delete($data['photo_path']);
            throw $exception;
        }

        return redirect()->route('admin.dashboard', ['tab' => 'students'])->with('status', 'Profil siswa berhasil ditambahkan.');
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'nisn' => ['required', 'string', 'max:20', Rule::unique('students', 'nisn')->ignore($student->id)],
            'major' => ['required', 'string', 'max:50'],
            'kelas' => ['nullable', 'string', 'max:50'],
            'quote' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);
        $previousPhotoPath = $student->photo_path;

        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('students', 'public');
            if ($photoPath === false) {
                return back()->withInput()->withErrors(['photo' => 'Foto gagal disimpan. Data siswa tidak diubah.']);
            }
            $data['photo_path'] = $photoPath;
        }
        unset($data['photo']);

        try {
            $student->update($data);
        } catch (\Throwable $exception) {
            if (isset($data['photo_path'])) Storage::disk('public')->delete($data['photo_path']);
            throw $exception;
        }

        if (isset($data['photo_path']) && $previousPhotoPath) {
            Storage::disk('public')->delete($previousPhotoPath);
        }

        return redirect()->route('admin.dashboard', ['tab' => 'students'])->with('status', 'Profil siswa berhasil diperbarui.');
    }

    public function destroyStudent(Student $student): RedirectResponse
    {
        if ($student->photo_path && !Storage::disk('public')->delete($student->photo_path)) {
            return back()->withErrors(['student' => 'Foto siswa gagal dihapus. Data siswa tidak diubah.']);
        }
        $student->delete();

        return redirect()->route('admin.dashboard', ['tab' => 'students'])->with('status', 'Data siswa berhasil dihapus.');
    }

    public function storePhoto(Request $request): RedirectResponse
    {
        $section = $request->input('section');
        $data = $request->validate([
            'section' => ['required', Rule::in(['major', 'film', 'flashmob'])],
            'group_name' => [$section === 'major' ? 'required' : 'nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:150'],
            'photo' => ['required', 'image', 'max:5120'],
        ]);
        $photoPath = $request->file('photo')->store('landing', 'public');
        if ($photoPath === false) {
            return back()->withInput()->withErrors(['photo' => 'Foto galeri gagal disimpan. Silakan coba lagi.']);
        }
        if ($data['section'] !== 'major') $data['group_name'] = null;
        $data['photo_path'] = $photoPath;
        unset($data['photo']);

        try {
            LandingPhoto::create($data);
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($photoPath);
            throw $exception;
        }

        return redirect()->route('admin.dashboard', ['tab' => 'gallery'])->with('status', 'Foto landing page berhasil ditambahkan.');
    }

    public function destroyPhoto(LandingPhoto $landingPhoto): RedirectResponse
    {
        if (!Storage::disk('public')->delete($landingPhoto->photo_path)) {
            return back()->withErrors(['gallery' => 'Foto gagal dihapus. Data foto tidak diubah.']);
        }
        $landingPhoto->delete();

        return redirect()->route('admin.dashboard', ['tab' => 'gallery'])->with('status', 'Foto galeri berhasil dihapus.');
    }
}

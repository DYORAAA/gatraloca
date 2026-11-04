@extends('admin.layout')

@section('title', 'Dashboard Admin')

@section('content')
<main class="dashboard-page">
    <div class="dashboard-wrap">
        <header class="dashboard-header">
            <div>
                <a class="back-link" href="{{ config('app.frontend_url') }}">← Lihat landing page</a>
                <p class="eyebrow">GATRALOCA · pengelolaan</p>
                <h1>Dashboard <em>Admin</em></h1>
                <p class="intro">Kelola data siswa dan galeri foto untuk landing page publik.</p>
            </div>
            <form action="{{ route('admin.logout') }}" method="post">
                @csrf
                <button class="button quiet" type="submit">Keluar</button>
            </form>
        </header>

        @if (session('status'))
            <div class="notice success" role="status">{{ session('status') }}</div>
        @endif
        @if ($errors->any())
            <div class="notice error" role="alert">{{ $errors->first() }}</div>
        @endif

        <div class="stats-grid" aria-label="Ringkasan konten">
            <article class="stat-card"><span>Profil siswa</span><strong>{{ number_format($studentCount, 0, ',', '.') }}</strong><small>muncul pada yearbook 3D</small></article>
            <article class="stat-card"><span>Foto galeri</span><strong>{{ number_format($photoCount, 0, ',', '.') }}</strong><small>jurusan, film, dan flashmob</small></article>
        </div>

        <nav class="dashboard-tabs" aria-label="Bagian dashboard">
            <a href="{{ route('admin.dashboard', ['tab' => 'students']) }}" data-admin-tab="students" @class(['active' => request('tab', 'students') === 'students'])>♙ <span>Data siswa</span></a>
            <a href="{{ route('admin.dashboard', ['tab' => 'gallery']) }}" data-admin-tab="gallery" @class(['active' => request('tab') === 'gallery'])>▧ <span>Galeri landing page</span><b>{{ $photoCount }}</b></a>
        </nav>

        <section class="tab-panel" id="students-panel" @if (request('tab') === 'gallery') hidden @endif>
            <div class="content-grid">
                <section class="panel form-panel">
                    <p class="eyebrow">Profil baru</p>
                    <h2>Tambah siswa</h2>
                    <form class="form-stack" action="{{ route('admin.students.store') }}" method="post" enctype="multipart/form-data">
                        @csrf
                        <label for="new-name">Nama lengkap</label>
                        <input id="new-name" name="name" maxlength="150" value="{{ old('name') }}" required>
                        <label for="new-nisn">NISN</label>
                        <input id="new-nisn" name="nisn" maxlength="20" value="{{ old('nisn') }}" required>
                        <label for="new-major">Jurusan</label>
                        <select id="new-major" name="major" required>
                            <option value="">Pilih jurusan</option>
                            @foreach (['DPIB', 'TKJ', 'TPM', 'TKR', 'TITL', 'TEI'] as $major)
                                <option value="{{ $major }}" @selected(old('major') === $major)>{{ $major }}</option>
                            @endforeach
                        </select>
                        <label for="new-class">Kelas <span class="optional">opsional</span></label>
                        <input id="new-class" name="kelas" maxlength="50" value="{{ old('kelas') }}" placeholder="Contoh: XII TKJ 1">
                        <label for="new-quote">Kutipan / cita-cita <span class="optional">opsional</span></label>
                        <textarea id="new-quote" name="quote" maxlength="500" rows="3">{{ old('quote') }}</textarea>
                        <label for="new-student-photo">Foto profil <span class="optional">maks. 5 MB</span></label>
                        <input id="new-student-photo" class="file-input" name="photo" type="file" accept="image/*" data-preview-target="new-student-preview">
                        <div class="photo-preview" id="new-student-preview" hidden>
                            <img alt="Pratinjau foto siswa">
                            <span>Pratinjau foto</span>
                        </div>
                        <button class="button primary" type="submit">Tambah ke yearbook <span>→</span></button>
                    </form>
                </section>

                <section class="panel student-panel">
                    <div class="list-heading">
                        <div><p class="eyebrow">Yearbook publik</p><h2>Daftar siswa <span class="count">{{ number_format($studentCount, 0, ',', '.') }}</span></h2></div>
                    </div>
                    <form class="student-search" action="{{ route('admin.dashboard') }}" method="get">
                        <input type="hidden" name="tab" value="students">
                        <label class="sr-only" for="student-search">Cari nama, NISN, jurusan, atau kelas</label>
                        <input id="student-search" type="search" name="search" value="{{ $search }}" placeholder="Cari nama, NISN, jurusan, kelas…">
                        <button class="button quiet" type="submit">Cari</button>
                        @if ($search)
                            <a class="clear-search" href="{{ route('admin.dashboard', ['tab' => 'students']) }}">Hapus</a>
                        @endif
                    </form>
                    <p class="result-caption">Menampilkan {{ $students->firstItem() ?? 0 }}–{{ $students->lastItem() ?? 0 }} dari {{ number_format($students->total(), 0, ',', '.') }} siswa</p>
                    @forelse ($students as $student)
                        <details class="student-item">
                            <summary>
                                @if ($student->photo_url)
                                    <img class="student-thumb" src="{{ $student->photo_url }}" alt="" loading="lazy">
                                @else
                                    <span class="avatar">{{ mb_substr($student->name, 0, 1) }}</span>
                                @endif
                                <span class="student-summary"><strong>{{ $student->name }}</strong><small>{{ $student->major }}@if ($student->kelas) · {{ $student->kelas }}@endif · NISN {{ $student->nisn }}</small></span>
                                <span class="edit-label">Edit <span aria-hidden="true">⌄</span></span>
                            </summary>
                            <form class="edit-form form-stack" action="{{ route('admin.students.update', $student) }}" method="post" enctype="multipart/form-data">
                                @csrf
                                @method('put')
                                <label for="name-{{ $student->id }}">Nama lengkap</label>
                                <input id="name-{{ $student->id }}" name="name" maxlength="150" value="{{ $student->name }}" required>
                                <label for="nisn-{{ $student->id }}">NISN</label>
                                <input id="nisn-{{ $student->id }}" name="nisn" maxlength="20" value="{{ $student->nisn }}" required>
                                <label for="major-{{ $student->id }}">Jurusan</label>
                                <select id="major-{{ $student->id }}" name="major" required>
                                    @foreach (['DPIB', 'TKJ', 'TPM', 'TKR', 'TITL', 'TEI'] as $major)
                                        <option value="{{ $major }}" @selected($student->major === $major)>{{ $major }}</option>
                                    @endforeach
                                </select>
                                <label for="class-{{ $student->id }}">Kelas</label>
                                <input id="class-{{ $student->id }}" name="kelas" maxlength="50" value="{{ $student->kelas }}">
                                <label for="quote-{{ $student->id }}">Kutipan / cita-cita</label>
                                <textarea id="quote-{{ $student->id }}" name="quote" maxlength="500" rows="2">{{ $student->quote }}</textarea>
                                <label for="photo-{{ $student->id }}">Ganti foto <span class="optional">opsional · maks. 5 MB</span></label>
                                <input id="photo-{{ $student->id }}" class="file-input" name="photo" type="file" accept="image/*" data-preview-target="preview-{{ $student->id }}">
                                <div class="photo-preview" id="preview-{{ $student->id }}" @if (!$student->photo_url) hidden @endif>
                                    <img src="{{ $student->photo_url }}" alt="Pratinjau foto {{ $student->name }}">
                                    <span>{{ $student->photo_url ? 'Foto saat ini atau pratinjau baru' : 'Pratinjau foto baru' }}</span>
                                </div>
                                <div class="form-actions">
                                    <button class="button primary" type="submit">Simpan perubahan</button>
                                    <button class="button danger" type="submit" form="delete-student-{{ $student->id }}" data-confirm="Hapus data {{ $student->name }}?">Hapus siswa</button>
                                </div>
                            </form>
                            <form id="delete-student-{{ $student->id }}" action="{{ route('admin.students.destroy', $student) }}" method="post" hidden>
                                @csrf
                                @method('delete')
                            </form>
                        </details>
                    @empty
                        <div class="empty-state"><span>⌕</span><strong>{{ $search ? 'Siswa tidak ditemukan' : 'Belum ada data siswa' }}</strong><p>{{ $search ? 'Coba kata kunci yang berbeda.' : 'Tambahkan profil siswa pertama menggunakan formulir.' }}</p></div>
                    @endforelse
                    @if ($students->hasPages())
                        <div class="pagination">{{ $students->links() }}</div>
                    @endif
                </section>
            </div>
        </section>

        <section class="tab-panel" id="gallery-panel" @if (request('tab') !== 'gallery') hidden @endif>
            <div class="gallery-grid">
                <section class="panel form-panel">
                    <p class="eyebrow">Galeri publik</p>
                    <h2>Tambah foto dokumentasi</h2>
                    <p class="panel-intro">Pilih bagian landing page tempat foto akan ditampilkan. Maksimum 5 MB per file.</p>
                    <form class="form-stack" action="{{ route('admin.photos.store') }}" method="post" enctype="multipart/form-data">
                        @csrf
                        <label for="photo-section">Bagian</label>
                        <select id="photo-section" name="section" required>
                            <option value="major">Dokumentasi jurusan</option>
                            <option value="film">Dokumentasi film</option>
                            <option value="flashmob">Flashmob</option>
                        </select>
                        <div id="major-select-wrap">
                            <label for="photo-major">Jurusan</label>
                            <select id="photo-major" name="group_name">
                                <option value="">Pilih jurusan</option>
                                @foreach (['DPIB', 'TKJ', 'TPM', 'TKR', 'TITL', 'TEI'] as $major)
                                    <option value="{{ $major }}">{{ $major }}</option>
                                @endforeach
                            </select>
                        </div>
                        <label for="photo-title">Keterangan foto <span class="optional">opsional</span></label>
                        <input id="photo-title" name="title" maxlength="150" placeholder="Contoh: Praktik kerja lapangan">
                        <label for="landing-photo">File foto</label>
                        <input id="landing-photo" class="file-input" name="photo" type="file" accept="image/*" required data-preview-target="landing-preview">
                        <div class="photo-preview wide-preview" id="landing-preview" hidden>
                            <img alt="Pratinjau foto galeri">
                            <span>Pratinjau sebelum diunggah</span>
                        </div>
                        <button class="button primary" type="submit">Tambah foto <span>→</span></button>
                    </form>
                </section>

                <section class="panel gallery-panel">
                    <div class="list-heading"><div><p class="eyebrow">Konten landing page</p><h2>Foto terkelola <span class="count">{{ $photoCount }}</span></h2></div></div>
                    @forelse ($photos as $photo)
                        <article class="gallery-item">
                            <img src="{{ $photo->photo_url }}" alt="{{ $photo->title ?: 'Foto galeri' }}" loading="lazy">
                            <div class="gallery-copy">
                                <strong>{{ $photo->title ?: 'Tanpa keterangan' }}</strong>
                                <small>
                                    @if ($photo->section === 'major') Dokumentasi jurusan · {{ $photo->group_name }}
                                    @elseif ($photo->section === 'film') Dokumentasi film
                                    @else Flashmob
                                    @endif
                                </small>
                            </div>
                            <form action="{{ route('admin.photos.destroy', $photo) }}" method="post">
                                @csrf
                                @method('delete')
                                <button class="button danger compact" type="submit" data-confirm="Hapus foto ini dari landing page?">Hapus</button>
                            </form>
                        </article>
                    @empty
                        <div class="empty-state"><span>▧</span><strong>Belum ada foto galeri</strong><p>Foto yang ditambahkan akan tampil di landing page publik.</p></div>
                    @endforelse
                </section>
            </div>
        </section>
    </div>
</main>
<script>
(() => {
    const section = document.getElementById('photo-section')
    const groupWrap = document.getElementById('major-select-wrap')
    const group = document.getElementById('photo-major')
    const syncPhotoSection = () => {
        const isMajor = section.value === 'major'
        groupWrap.hidden = !isMajor
        group.required = isMajor
    }
    section.addEventListener('change', syncPhotoSection)
    syncPhotoSection()

    document.querySelectorAll('[data-preview-target]').forEach(input => {
        input.addEventListener('change', () => {
            const preview = document.getElementById(input.dataset.previewTarget)
            const image = preview.querySelector('img')
            const file = input.files?.[0]
            if (!file) return
            if (image.dataset.objectUrl) URL.revokeObjectURL(image.dataset.objectUrl)
            image.dataset.objectUrl = URL.createObjectURL(file)
            image.src = image.dataset.objectUrl
            preview.hidden = false
        })
    })

    document.querySelectorAll('[data-confirm]').forEach(button => {
        button.addEventListener('click', event => {
            if (!window.confirm(button.dataset.confirm)) event.preventDefault()
        })
    })
})()
</script>
@endsection

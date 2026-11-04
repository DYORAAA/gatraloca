<?php $__env->startSection('title', 'Dashboard Admin'); ?>

<?php $__env->startSection('content'); ?>
<main class="dashboard-page">
    <div class="dashboard-wrap">
        <header class="dashboard-header">
            <div>
                <a class="back-link" href="<?php echo e(config('app.frontend_url')); ?>">← Lihat landing page</a>
                <p class="eyebrow">GATRALOCA · pengelolaan</p>
                <h1>Dashboard <em>Admin</em></h1>
                <p class="intro">Kelola data siswa dan galeri foto untuk landing page publik.</p>
            </div>
            <form action="<?php echo e(route('admin.logout')); ?>" method="post">
                <?php echo csrf_field(); ?>
                <button class="button quiet" type="submit">Keluar</button>
            </form>
        </header>

        <?php if(session('status')): ?>
            <div class="notice success" role="status"><?php echo e(session('status')); ?></div>
        <?php endif; ?>
        <?php if($errors->any()): ?>
            <div class="notice error" role="alert"><?php echo e($errors->first()); ?></div>
        <?php endif; ?>

        <div class="stats-grid" aria-label="Ringkasan konten">
            <article class="stat-card"><span>Profil siswa</span><strong><?php echo e(number_format($studentCount, 0, ',', '.')); ?></strong><small>muncul pada yearbook 3D</small></article>
            <article class="stat-card"><span>Foto galeri</span><strong><?php echo e(number_format($photoCount, 0, ',', '.')); ?></strong><small>jurusan, film, dan flashmob</small></article>
        </div>

        <nav class="dashboard-tabs" aria-label="Bagian dashboard">
            <a href="<?php echo e(route('admin.dashboard', ['tab' => 'students'])); ?>" data-admin-tab="students" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['active' => request('tab', 'students') === 'students']); ?>">♙ <span>Data siswa</span></a>
            <a href="<?php echo e(route('admin.dashboard', ['tab' => 'gallery'])); ?>" data-admin-tab="gallery" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['active' => request('tab') === 'gallery']); ?>">▧ <span>Galeri landing page</span><b><?php echo e($photoCount); ?></b></a>
        </nav>

        <section class="tab-panel" id="students-panel" <?php if(request('tab') === 'gallery'): ?> hidden <?php endif; ?>>
            <div class="content-grid">
                <section class="panel form-panel">
                    <p class="eyebrow">Profil baru</p>
                    <h2>Tambah siswa</h2>
                    <form class="form-stack" action="<?php echo e(route('admin.students.store')); ?>" method="post" enctype="multipart/form-data">
                        <?php echo csrf_field(); ?>
                        <label for="new-name">Nama lengkap</label>
                        <input id="new-name" name="name" maxlength="150" value="<?php echo e(old('name')); ?>" required>
                        <label for="new-nisn">NISN</label>
                        <input id="new-nisn" name="nisn" maxlength="20" value="<?php echo e(old('nisn')); ?>" required>
                        <label for="new-major">Jurusan</label>
                        <select id="new-major" name="major" required>
                            <option value="">Pilih jurusan</option>
                            <?php $__currentLoopData = ['DPIB', 'TKJ', 'TPM', 'TKR', 'TITL', 'TEI']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $major): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <option value="<?php echo e($major); ?>" <?php if(old('major') === $major): echo 'selected'; endif; ?>><?php echo e($major); ?></option>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </select>
                        <label for="new-class">Kelas <span class="optional">opsional</span></label>
                        <input id="new-class" name="kelas" maxlength="50" value="<?php echo e(old('kelas')); ?>" placeholder="Contoh: XII TKJ 1">
                        <label for="new-quote">Kutipan / cita-cita <span class="optional">opsional</span></label>
                        <textarea id="new-quote" name="quote" maxlength="500" rows="3"><?php echo e(old('quote')); ?></textarea>
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
                        <div><p class="eyebrow">Yearbook publik</p><h2>Daftar siswa <span class="count"><?php echo e(number_format($studentCount, 0, ',', '.')); ?></span></h2></div>
                    </div>
                    <form class="student-search" action="<?php echo e(route('admin.dashboard')); ?>" method="get">
                        <input type="hidden" name="tab" value="students">
                        <label class="sr-only" for="student-search">Cari nama, NISN, jurusan, atau kelas</label>
                        <input id="student-search" type="search" name="search" value="<?php echo e($search); ?>" placeholder="Cari nama, NISN, jurusan, kelas…">
                        <button class="button quiet" type="submit">Cari</button>
                        <?php if($search): ?>
                            <a class="clear-search" href="<?php echo e(route('admin.dashboard', ['tab' => 'students'])); ?>">Hapus</a>
                        <?php endif; ?>
                    </form>
                    <p class="result-caption">Menampilkan <?php echo e($students->firstItem() ?? 0); ?>–<?php echo e($students->lastItem() ?? 0); ?> dari <?php echo e(number_format($students->total(), 0, ',', '.')); ?> siswa</p>
                    <?php $__empty_1 = true; $__currentLoopData = $students; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $student): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <details class="student-item">
                            <summary>
                                <?php if($student->photo_url): ?>
                                    <img class="student-thumb" src="<?php echo e($student->photo_url); ?>" alt="" loading="lazy">
                                <?php else: ?>
                                    <span class="avatar"><?php echo e(mb_substr($student->name, 0, 1)); ?></span>
                                <?php endif; ?>
                                <span class="student-summary"><strong><?php echo e($student->name); ?></strong><small><?php echo e($student->major); ?><?php if($student->kelas): ?> · <?php echo e($student->kelas); ?><?php endif; ?> · NISN <?php echo e($student->nisn); ?></small></span>
                                <span class="edit-label">Edit <span aria-hidden="true">⌄</span></span>
                            </summary>
                            <form class="edit-form form-stack" action="<?php echo e(route('admin.students.update', $student)); ?>" method="post" enctype="multipart/form-data">
                                <?php echo csrf_field(); ?>
                                <?php echo method_field('put'); ?>
                                <label for="name-<?php echo e($student->id); ?>">Nama lengkap</label>
                                <input id="name-<?php echo e($student->id); ?>" name="name" maxlength="150" value="<?php echo e($student->name); ?>" required>
                                <label for="nisn-<?php echo e($student->id); ?>">NISN</label>
                                <input id="nisn-<?php echo e($student->id); ?>" name="nisn" maxlength="20" value="<?php echo e($student->nisn); ?>" required>
                                <label for="major-<?php echo e($student->id); ?>">Jurusan</label>
                                <select id="major-<?php echo e($student->id); ?>" name="major" required>
                                    <?php $__currentLoopData = ['DPIB', 'TKJ', 'TPM', 'TKR', 'TITL', 'TEI']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $major): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <option value="<?php echo e($major); ?>" <?php if($student->major === $major): echo 'selected'; endif; ?>><?php echo e($major); ?></option>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </select>
                                <label for="class-<?php echo e($student->id); ?>">Kelas</label>
                                <input id="class-<?php echo e($student->id); ?>" name="kelas" maxlength="50" value="<?php echo e($student->kelas); ?>">
                                <label for="quote-<?php echo e($student->id); ?>">Kutipan / cita-cita</label>
                                <textarea id="quote-<?php echo e($student->id); ?>" name="quote" maxlength="500" rows="2"><?php echo e($student->quote); ?></textarea>
                                <label for="photo-<?php echo e($student->id); ?>">Ganti foto <span class="optional">opsional · maks. 5 MB</span></label>
                                <input id="photo-<?php echo e($student->id); ?>" class="file-input" name="photo" type="file" accept="image/*" data-preview-target="preview-<?php echo e($student->id); ?>">
                                <div class="photo-preview" id="preview-<?php echo e($student->id); ?>" <?php if(!$student->photo_url): ?> hidden <?php endif; ?>>
                                    <img src="<?php echo e($student->photo_url); ?>" alt="Pratinjau foto <?php echo e($student->name); ?>">
                                    <span><?php echo e($student->photo_url ? 'Foto saat ini atau pratinjau baru' : 'Pratinjau foto baru'); ?></span>
                                </div>
                                <div class="form-actions">
                                    <button class="button primary" type="submit">Simpan perubahan</button>
                                    <button class="button danger" type="submit" form="delete-student-<?php echo e($student->id); ?>" data-confirm="Hapus data <?php echo e($student->name); ?>?">Hapus siswa</button>
                                </div>
                            </form>
                            <form id="delete-student-<?php echo e($student->id); ?>" action="<?php echo e(route('admin.students.destroy', $student)); ?>" method="post" hidden>
                                <?php echo csrf_field(); ?>
                                <?php echo method_field('delete'); ?>
                            </form>
                        </details>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <div class="empty-state"><span>⌕</span><strong><?php echo e($search ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'); ?></strong><p><?php echo e($search ? 'Coba kata kunci yang berbeda.' : 'Tambahkan profil siswa pertama menggunakan formulir.'); ?></p></div>
                    <?php endif; ?>
                    <?php if($students->hasPages()): ?>
                        <div class="pagination"><?php echo e($students->links()); ?></div>
                    <?php endif; ?>
                </section>
            </div>
        </section>

        <section class="tab-panel" id="gallery-panel" <?php if(request('tab') !== 'gallery'): ?> hidden <?php endif; ?>>
            <div class="gallery-grid">
                <section class="panel form-panel">
                    <p class="eyebrow">Galeri publik</p>
                    <h2>Tambah foto dokumentasi</h2>
                    <p class="panel-intro">Pilih bagian landing page tempat foto akan ditampilkan. Maksimum 5 MB per file.</p>
                    <form class="form-stack" action="<?php echo e(route('admin.photos.store')); ?>" method="post" enctype="multipart/form-data">
                        <?php echo csrf_field(); ?>
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
                                <?php $__currentLoopData = ['DPIB', 'TKJ', 'TPM', 'TKR', 'TITL', 'TEI']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $major): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($major); ?>"><?php echo e($major); ?></option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
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
                    <div class="list-heading"><div><p class="eyebrow">Konten landing page</p><h2>Foto terkelola <span class="count"><?php echo e($photoCount); ?></span></h2></div></div>
                    <?php $__empty_1 = true; $__currentLoopData = $photos; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $photo): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <article class="gallery-item">
                            <img src="<?php echo e($photo->photo_url); ?>" alt="<?php echo e($photo->title ?: 'Foto galeri'); ?>" loading="lazy">
                            <div class="gallery-copy">
                                <strong><?php echo e($photo->title ?: 'Tanpa keterangan'); ?></strong>
                                <small>
                                    <?php if($photo->section === 'major'): ?> Dokumentasi jurusan · <?php echo e($photo->group_name); ?>

                                    <?php elseif($photo->section === 'film'): ?> Dokumentasi film
                                    <?php else: ?> Flashmob
                                    <?php endif; ?>
                                </small>
                            </div>
                            <form action="<?php echo e(route('admin.photos.destroy', $photo)); ?>" method="post">
                                <?php echo csrf_field(); ?>
                                <?php echo method_field('delete'); ?>
                                <button class="button danger compact" type="submit" data-confirm="Hapus foto ini dari landing page?">Hapus</button>
                            </form>
                        </article>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <div class="empty-state"><span>▧</span><strong>Belum ada foto galeri</strong><p>Foto yang ditambahkan akan tampil di landing page publik.</p></div>
                    <?php endif; ?>
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
<?php $__env->stopSection(); ?>

<?php echo $__env->make('admin.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /home/rizki181007/gatraloca/backend/resources/views/admin/dashboard.blade.php ENDPATH**/ ?>
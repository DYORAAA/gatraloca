<?php $__env->startSection('title', 'Masuk Admin'); ?>

<?php $__env->startSection('content'); ?>
<main class="login-page">
    <section class="login-card">
        <a class="back-link" href="<?php echo e(config('app.frontend_url')); ?>">← Kembali ke landing page</a>
        <p class="eyebrow">Area terbatas · GATRALOCA 58</p>
        <h1>Masuk <em>Admin</em></h1>
        <p class="intro">Kelola profil siswa dan foto galeri yang tampil pada landing page publik.</p>

        <?php if(session('status')): ?>
            <div class="notice success" role="status"><?php echo e(session('status')); ?></div>
        <?php endif; ?>
        <?php if(!$configured): ?>
            <div class="notice warning" role="alert">Login admin belum aktif. Atur <code>ADMIN_USERNAME</code> dan <code>ADMIN_PASSWORD</code> pada <code>backend/.env</code>.</div>
        <?php endif; ?>
        <?php if($errors->any()): ?>
            <div class="notice error" role="alert"><?php echo e($errors->first()); ?></div>
        <?php endif; ?>

        <form class="form-stack" action="<?php echo e(route('admin.login.submit')); ?>" method="post">
            <?php echo csrf_field(); ?>
            <label for="username">Username admin</label>
            <input id="username" name="username" type="text" autocomplete="username" value="<?php echo e(old('username')); ?>" required autofocus>
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>
            <button class="button primary" type="submit" <?php if(!$configured): echo 'disabled'; endif; ?>>Masuk ke dashboard <span>→</span></button>
        </form>
        <p class="login-footnote">Akses dashboard hanya tersedia untuk admin yang berwenang.</p>
    </section>
</main>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('admin.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /home/rizki181007/gatraloca/backend/resources/views/admin/login.blade.php ENDPATH**/ ?>
@extends('admin.layout')

@section('title', 'Masuk Admin')

@section('content')
<main class="login-page">
    <section class="login-card">
        <a class="back-link" href="{{ config('app.frontend_url') }}">← Kembali ke landing page</a>
        <p class="eyebrow">Area terbatas · GATRALOCA 58</p>
        <h1>Masuk <em>Admin</em></h1>
        <p class="intro">Kelola profil siswa dan foto galeri yang tampil pada landing page publik.</p>

        @if (session('status'))
            <div class="notice success" role="status">{{ session('status') }}</div>
        @endif
        @if (!$configured)
            <div class="notice warning" role="alert">Login admin belum aktif. Atur <code>ADMIN_USERNAME</code> dan <code>ADMIN_PASSWORD</code> pada <code>backend/.env</code>.</div>
        @endif
        @if ($errors->any())
            <div class="notice error" role="alert">{{ $errors->first() }}</div>
        @endif

        <form class="form-stack" action="{{ route('admin.login.submit') }}" method="post">
            @csrf
            <label for="username">Username admin</label>
            <input id="username" name="username" type="text" autocomplete="username" value="{{ old('username') }}" required autofocus>
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>
            <button class="button primary" type="submit" @disabled(!$configured)>Masuk ke dashboard <span>→</span></button>
        </form>
        <p class="login-footnote">Akses dashboard hanya tersedia untuk admin yang berwenang.</p>
    </section>
</main>
@endsection

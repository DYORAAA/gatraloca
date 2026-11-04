import { useEffect, useState } from 'react'
import { landingPhotoApi } from '../api/students'

export default function Hero() {
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [photoState, setPhotoState] = useState('loading')

  useEffect(() => {
    let active = true
    landingPhotoApi.list({ section: 'flashmob' })
      .then(({ data }) => {
        if (!active) return
        const photo = data[0] ?? null
        setCoverPhoto(photo)
        setPhotoState(photo ? 'ready' : 'empty')
      })
      .catch(() => {
        if (active) setPhotoState('error')
      })
    return () => { active = false }
  }, [])

  return (
    <header className="hero" id="home">
      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow">SMKN 2 PROBOLINGGO <span>·</span> ANGKATAN KE-58</p>
          <h1>GATRA<span>LOCA</span></h1>
          <p className="hero-intro">Hari ini langkah kita mulai menuju arah yang berbeda. Namun tawa di kelas, bahu yang saling menguatkan, dan semua cerita kita akan selalu menjadi rumah untuk pulang.</p>
          <div className="hero-buttons">
            <a href="#yearbook3d" className="btn gold">Buka buku kenangan <span>↘</span></a>
            <a href="#jurusan" className="btn outline">Jelajahi cerita <span>↗</span></a>
          </div>
          <p className="hero-caption">2023 — 2026 <i /> Berpisah langkah, tetap satu cerita.</p>
        </div>
        <figure className="hero-art">
          <div className={`hero-photo-frame${photoState === 'ready' ? ' has-photo' : ''}`}>
            {photoState === 'ready' ? (
              <img
                className="hero-group-photo"
                src={coverPhoto.photo_url}
                alt={coverPhoto.title || 'Foto kebersamaan angkatan GATRALOCA 58'}
                fetchPriority="high"
                onError={() => setPhotoState('error')}
              />
            ) : (
              <div className="hero-photo-empty" role={photoState === 'loading' ? 'status' : undefined}>
                <span className="hero-photo-empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none">
                    <rect x="3.5" y="6.5" width="25" height="19" rx="2" />
                    <circle cx="11" cy="13" r="2.5" />
                    <path d="m5 23 7-6 5 4 4-3 6 6" />
                  </svg>
                </span>
                <strong>{photoState === 'loading' ? 'Memuat foto angkatan' : 'Foto angkatan segera hadir'}</strong>
                <span>{photoState === 'error'
                  ? 'Foto flashmob belum dapat dimuat. Coba muat ulang halaman.'
                  : 'Unggah foto kebersamaan di galeri Flashmob agar tampil di sini.'}</span>
              </div>
            )}
            {photoState === 'ready' && (
              <>
                <div className="hero-photo-shade" aria-hidden="true" />
                <span className="hero-photo-tag">GATRALOCA <i /> ANGKATAN 58</span>
                <div className="hero-photo-title">
                  <span>POTRET ANGKATAN</span>
                  <strong>Hari ini berpisah,<br />kenangan tetap bersama.</strong>
                </div>
              </>
            )}
            <div className="hero-stamp"><span>58</span><small>angkatan<br />ke-58</small></div>
          </div>
          <figcaption className="hero-art-caption">
            <span>{photoState === 'ready' && coverPhoto?.title || 'MOMEN KEBERSAMAAN ANGKATAN'}</span>
            <span>SMKN 2 PROBOLINGGO</span>
          </figcaption>
        </figure>
      </div>
      <a className="hero-bottomline" href="#jurusan"><span>UNTUK SEMUA CERITA YANG PERNAH KITA BAGIKAN</span><span>KENANGI <b>↓</b></span></a>
    </header>
  )
}

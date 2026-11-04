import { useEffect, useState } from 'react'
import { landingPhotoApi } from '../api/students'

export default function FilmSection() {
  const [photos, setPhotos] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    landingPhotoApi.list({ section: 'film' })
      .then(({ data }) => {
        if (active) setPhotos(data)
      })
      .catch(() => {
        if (active) setLoadError('Dokumentasi film belum dapat dimuat.')
      })
    return () => { active = false }
  }, [])

  return (
    <section className="section dark" id="film">
      <div className="container">
        <p className="eyebrow">02 / Saat-saat yang ingin kita ulang</p>
        <h2>Jejak dalam bingkai.</h2>

        <div className="film-layout">
          <div className={`film-visual${photos[0] ? ' has-photo' : ''}`}>
            {photos[0]
              ? <img src={photos[0].photo_url} alt={photos[0].title || 'Dokumentasi film angkatan'} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true }} />
              : <div className="film-visual-empty"><span>58</span><small>ARSIP AUDIOVISUAL<br />GATRALOCA</small></div>}
            <span className="film-visual-label">GATRALOCA <i /> FILM ANGKATAN</span>
          </div>
          <div className="film-content">
            <p className="section-kicker">SMKN 2 PROBOLINGGO · 2023—2026</p>
            <h3>Waktu boleh berlalu,<br /><em>cerita kita tetap tinggal.</em></h3>
            <p>Di balik setiap tawa dan langkah kecil, ada teman-teman yang membuat perjalanan ini berarti. Inilah potongan kisah yang akan kita rindukan.</p>
            {loadError && <p className="admin-message error" role="status">{loadError}</p>}
            {photos.length === 0 && !loadError && <p className="film-unavailable">Dokumentasi film akan hadir di sini.</p>}
            {photos.length > 1 && <p className="film-photo-count">{photos.length} foto dokumentasi</p>}
          </div>
        </div>
        {photos.length > 1 && (
          <div className="film-gallery" aria-label="Dokumentasi film angkatan">
            {photos.slice(1).map(photo => (
              <img key={photo.id} src={photo.photo_url} alt={photo.title || 'Dokumentasi film angkatan'} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true }} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

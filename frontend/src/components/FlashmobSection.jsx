import { useEffect, useState } from 'react'
import { adminDashboardUrl, landingPhotoApi } from '../api/students'

export default function FlashmobSection() {
  const [photos, setPhotos] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    landingPhotoApi.list({ section: 'flashmob' })
      .then(({ data }) => {
        if (active) setPhotos(data)
      })
      .catch(() => {
        if (active) setLoadError('Foto flashmob belum dapat dimuat.')
      })
    return () => { active = false }
  }, [])

  return (
    <section className="section" id="flashmob">
      <div className="container">
        <p className="eyebrow">03 / Dalam langkah yang sama</p>
        <h2>Selama bersama, kita berarti.</h2>
        <p className="description">Mungkin ini salah satu gerakan terakhir kita sebagai satu angkatan. Namun kebersamaan yang mengiringinya akan terus hidup di hati.</p>
        {loadError
          ? <p className="admin-message error" role="status">{loadError}</p>
          : photos.length === 0
            ? (
              <div className="flash-empty-card">
                <div>
                  <p className="section-kicker">ARSIP GATRALOCA</p>
                  <h3>Simpan satu lagi cerita bersama.</h3>
                  <p>Setiap senyum dalam dokumentasi ini kelak akan mengingatkan kita bahwa pernah ada hari-hari indah yang kita jalani bersama.</p>
                </div>
                <a href={adminDashboardUrl}>Kelola galeri <span aria-hidden="true">↗</span></a>
              </div>
            )
            : <div className="flash-grid">
              {photos.map((photo, index) => (
                <figure className="flash-tile" key={photo.id}>
                  <img src={photo.photo_url} alt={photo.title || `Momen flashmob ${index + 1}`} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true }} />
                  {photo.title && <span>{photo.title}</span>}
                </figure>
              ))}
            </div>}
      </div>
    </section>
  )
}

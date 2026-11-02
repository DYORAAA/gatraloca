import { useEffect, useState } from 'react'
import { landingPhotoApi } from '../api/students'

const JURUSAN = [
  { id: 1, code: '01', name: 'DPIB', desc: 'Desain Pemodelan dan Informasi Bangunan.' },
  { id: 2, code: '02', name: 'TKJ',  desc: 'Teknik Komputer dan Jaringan.' },
  { id: 3, code: '03', name: 'TPM',  desc: 'Teknik Pemesinan.' },
  { id: 4, code: '04', name: 'TKR',  desc: 'Teknik Kendaraan Ringan.' },
  { id: 5, code: '05', name: 'TITL', desc: 'Teknik Instalasi Tenaga Listrik.' },
  { id: 6, code: '06', name: 'TEI',  desc: 'Teknik Elektronika Industri.' },
]

export default function JurusanSection() {
  const [photos, setPhotos] = useState([])
  const [loadError, setLoadError] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let active = true
    landingPhotoApi.list({ section: 'major' })
      .then(({ data }) => {
        if (active) setPhotos(data)
      })
      .catch(() => {
        if (active) setLoadError('Dokumentasi jurusan belum dapat dimuat.')
      })
    return () => { active = false }
  }, [])

  return (
    <section className="section" id="jurusan">
      <div className="container">
        <p className="eyebrow">01 / Tempat kita tumbuh bersama</p>
        <h2>Enam jurusan,<br /><em>satu keluarga.</em></h2>
        <p className="description">
          Ruang kelas boleh berbeda, tetapi perjuangan, tawa, dan persahabatan yang kita bagi akan selalu menyatukan kita.
        </p>
        {loadError && <p className="admin-message error" role="status">{loadError}</p>}

        <div className="class-grid">
          {JURUSAN.map(j => {
            const gallery = photos.filter(photo => photo.group_name === j.name)
            return (
              <article className="class-card" key={j.id}>
                <div className="card-image">
                  {gallery[0] ? <img src={gallery[0].photo_url} alt={gallery[0].title || `Dokumentasi ${j.name}`} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true }} /> : <span>{j.code}</span>}
                  <small>{gallery.length ? `${gallery.length} foto` : 'Arsip angkatan 58'}</small>
                </div>
                <div className="card-content">
                  <div className="card-title-row"><span>{j.code} / 06</span><h3>{j.name}</h3></div>
                  <p>{j.desc}</p>
                  <button className="view-gallery" type="button" onClick={() => setModal(j)}>
                    {gallery.length ? `Jelajahi ${gallery.length} foto` : 'Lihat arsip jurusan'} <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={event => event.target === event.currentTarget && setModal(null)}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="major-gallery-title">
            <button className="close-modal" type="button" onClick={() => setModal(null)}>Tutup ✕</button>
            <h2 id="major-gallery-title">{modal.name} — Dokumentasi</h2>
            <div className="gallery">
              {photos.filter(photo => photo.group_name === modal.name).length > 0
                ? photos.filter(photo => photo.group_name === modal.name).map(photo => (
                    <img key={photo.id} src={photo.photo_url} alt={photo.title || `Foto ${modal.name}`} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true }} />
                  ))
                : <p className="admin-empty">Belum ada foto dokumentasi.</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

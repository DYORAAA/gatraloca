import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Hero from '../components/Hero'
import JurusanSection from '../components/JurusanSection'
import FilmSection from '../components/FilmSection'
import FlashmobSection from '../components/FlashmobSection'

const YearbookPage = lazy(() => import('./YearbookPage'))

function DeferredYearbook() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' && !('IntersectionObserver' in window)
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    if (!('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '400px 0px' })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <div id="yearbook3d" ref={sectionRef}>
      {visible
        ? <Suspense fallback={<div className="yearbook3d-loading">Membuka kembali halaman kenangan…</div>}><YearbookPage /></Suspense>
        : (
          <section className="yearbook3d-loading">
            <p className="eyebrow">04 / Jejak yang tak pernah benar-benar pergi</p>
            <h2>Buku kenangan <em>3D</em></h2>
            <p className="description">Sebelum melangkah ke jalan masing-masing, mari sejenak mengingat semua cerita yang telah menjadikan kita keluarga.</p>
          </section>
        )}
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <JurusanSection />
      <FilmSection />
      <FlashmobSection />
      <DeferredYearbook />
    </>
  )
}

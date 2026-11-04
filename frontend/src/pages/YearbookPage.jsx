import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { studentApi } from '../api/students'
import '../styles/yearbook3d.css'

const W = 2
const H = 2.8
const BW = W + 0.05
const BH = H + 0.14
const GAP = 0.045
const SEGMENTS = 24
const CURL = 0.8
const PI = Math.PI
const COLORS = { green: '#1b3a2c', gold: '#c8a45c', cream: '#f3efe3', darkGold: '#9a7a35' }
const FONT = 'Georgia,"Times New Roman",serif'

function makeStudents(records) {
  return records.map(record => ({
    nama: record.name,
    kelas: record.kelas || record.major || '',
    jurusan: record.major || '',
    cita: record.quote ?? '',
    photoUrl: record.photo_url,
    img: null,
  }))
}

function makeMockStudents() {
  const examples = [
    { nama: 'M. RIZKI IRAWAN', kelas: 'XII TKJ 1' },
    { nama: 'ALDO CAHYA PRATAMA', kelas: 'XII TKJ 2' },
    { nama: 'FAREL HOFI', kelas: 'XII TKJ 1' },
    { nama: 'DHIYA ULHAQ', kelas: 'XII TKJ 1' },
    { nama: 'NAMA CONTOH 05', kelas: 'XII TKJ 1' },
    { nama: 'NAMA CONTOH 06', kelas: 'XII TKJ 2' },
  ]
  return examples.map(({ nama, kelas }) => ({
    nama,
    kelas,
    jurusan: '',
    cita: 'Satu angkatan, banyak cerita. Kenangan kita akan selalu tinggal.',
    photoUrl: null,
    img: null,
    mock: true,
  }))
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = text.split(/\s+/)
  let line = ''
  let lines = []
  const letterSpacing = 0.7
  const textWidth = value => ctx.measureText(value).width + Math.max(0, value.length - 1) * letterSpacing
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (line && textWidth(candidate) > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines)
    let lastLine = lines[maxLines - 1]
    while (lastLine && textWidth(`${lastLine}…`) > maxWidth) {
      lastLine = lastLine.slice(0, -1)
    }
    lines[maxLines - 1] = `${lastLine.trimEnd()}…`
  }
  lines.forEach((value, index) => {
    let cursor = x
    for (const character of value) {
      ctx.fillText(character, cursor, y + index * lineHeight)
      cursor += ctx.measureText(character).width + letterSpacing
    }
  })
}

function addGrain(ctx, width, height, count, alpha) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `${i & 1 ? 'rgba(0,0,0,' : 'rgba(255,255,255,'}${alpha * Math.random()})`
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
  }
}

function spacedText(ctx, text, centerX, y, spacing) {
  let totalWidth = -spacing
  for (const char of text) totalWidth += ctx.measureText(char).width + spacing
  let x = centerX - totalWidth / 2
  ctx.textAlign = 'left'
  for (const char of text) {
    ctx.fillText(char, x, y)
    x += ctx.measureText(char).width + spacing
  }
}

function spacedTextLeft(ctx, text, x, y, spacing) {
  for (const char of text) {
    ctx.fillText(char, x, y)
    x += ctx.measureText(char).width + spacing
  }
}

function goldGradient(ctx, y0, y1) {
  const gradient = ctx.createLinearGradient(0, y0, 0, y1)
  gradient.addColorStop(0, '#f3dc94')
  gradient.addColorStop(0.5, COLORS.gold)
  gradient.addColorStop(1, '#8a6a2a')
  return gradient
}

function drawCover(ctx, width, height, logo) {
  let gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#24503c')
  gradient.addColorStop(1, '#0f2218')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  addGrain(ctx, width, height, 70000, 0.13)
  gradient = ctx.createRadialGradient(width / 2, height * 0.4, height * 0.2, width / 2, height / 2, height * 0.75)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,.45)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = goldGradient(ctx, 0, height)
  ctx.fillStyle = goldGradient(ctx, 0, height)
  ctx.lineWidth = 7
  ctx.strokeRect(44, 44, width - 88, height - 88)
  ctx.lineWidth = 2
  ctx.strokeRect(66, 66, width - 132, height - 132)

  const corners = [[66, 66, 1, 1], [width - 66, 66, -1, 1], [66, height - 66, 1, -1], [width - 66, height - 66, -1, -1]]
  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i]
    const x = corner[0]
    const y = corner[1]
    const sx = corner[2]
    const sy = corner[3]
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(sx, sy)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 64, 0, PI / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(30, 12)
    ctx.lineTo(46, 30)
    ctx.lineTo(30, 48)
    ctx.lineTo(14, 30)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const logoX = width / 2
  const logoY = height * 0.33
  const radius = 175
  ctx.fillStyle = COLORS.cream
  ctx.beginPath()
  ctx.arc(logoX, logoY, radius, 0, PI * 2)
  ctx.fill()
  if (logo) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoX, logoY, radius - 10, 0, PI * 2)
    ctx.clip()
    const scale = Math.min((2 * radius - 24) / logo.width, (2 * radius - 24) / logo.height)
    ctx.drawImage(logo, logoX - logo.width * scale / 2, logoY - logo.height * scale / 2, logo.width * scale, logo.height * scale)
    ctx.restore()
  } else {
    ctx.fillStyle = COLORS.green
    ctx.textAlign = 'center'
    ctx.font = `bold 150px ${FONT}`
    ctx.fillText('G', logoX, logoY + 50)
    ctx.font = `22px ${FONT}`
    ctx.fillText('LOGO', logoX, logoY + 100)
  }
  ctx.strokeStyle = goldGradient(ctx, logoY - radius, logoY + radius)
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(logoX, logoY, radius, 0, PI * 2)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(logoX, logoY, radius + 18, 0, PI * 2)
  ctx.stroke()

  ctx.font = `bold 100px ${FONT}`
  const gatraWidth = ctx.measureText('GATRA').width
  const locaWidth = ctx.measureText('LOCA').width
  const titleX = width / 2 - (gatraWidth + locaWidth) / 2
  const titleY = height * 0.64
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.cream
  ctx.fillText('GATRA', titleX, titleY)
  ctx.fillStyle = goldGradient(ctx, titleY - 80, titleY + 10)
  ctx.fillText('LOCA', titleX + gatraWidth, titleY)
  ctx.textAlign = 'center'
  ctx.font = `bold 150px ${FONT}`
  ctx.fillStyle = goldGradient(ctx, titleY + 10, titleY + 150)
  ctx.fillText('58', width / 2, titleY + 160)
  ctx.fillStyle = goldGradient(ctx, 0, height)
  ctx.fillRect(width / 2 - 230, titleY + 100, 130, 3)
  ctx.fillRect(width / 2 + 100, titleY + 100, 130, 3)
  ctx.font = `bold 40px ${FONT}`
  ctx.fillStyle = COLORS.cream
  spacedText(ctx, 'SMKN 2 PROBOLINGGO', width / 2, height * 0.89, 8)
}

function drawBoard(ctx, width, height, left, lines, subtitle) {
  let gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1f4333')
  gradient.addColorStop(1, '#12261c')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  addGrain(ctx, width, height, 30000, 0.1)
  const pageWidth = width * W / BW
  const margin = height * 0.07 / BH
  const pageX = left ? width - pageWidth : 0
  gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f7f3e7')
  gradient.addColorStop(1, '#e9e1cb')
  ctx.fillStyle = gradient
  ctx.fillRect(pageX, margin, pageWidth, height - 2 * margin)
  addGrain(ctx, width, height, 12000, 0.04)
  const gutterGradient = left ? ctx.createLinearGradient(width, 0, width - 120, 0) : ctx.createLinearGradient(0, 0, 120, 0)
  gutterGradient.addColorStop(0, 'rgba(0,0,0,.25)')
  gutterGradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gutterGradient
  ctx.fillRect(left ? width - 120 : 0, 0, 120, height)
  const centerX = pageX + pageWidth / 2
  const centerY = height / 2
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.green
  ctx.font = `italic 44px ${FONT}`
  lines.forEach((line, index) => ctx.fillText(line, centerX, centerY - 30 + index * 62))
  ctx.fillStyle = COLORS.gold
  ctx.beginPath()
  const diamondY = centerY + lines.length * 62 + 10
  ctx.moveTo(centerX, diamondY - 14)
  ctx.lineTo(centerX + 14, diamondY)
  ctx.lineTo(centerX, diamondY + 14)
  ctx.lineTo(centerX - 14, diamondY)
  ctx.fill()
  ctx.fillStyle = COLORS.darkGold
  ctx.font = `bold 26px ${FONT}`
  spacedText(ctx, subtitle, centerX, diamondY + 80, 8)
}

function fitPhoto(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  ctx.drawImage(image, x + (width - image.width * scale) / 2, y + (height - image.height * scale) / 2, image.width * scale, image.height * scale)
  ctx.restore()
}

function drawStudentPage(ctx, width, height, pageIndex, left, students) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f7f3e7')
  gradient.addColorStop(1, '#ebe4d0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  addGrain(ctx, width, height, 16000, 0.05)
  const gutterGradient = left ? ctx.createLinearGradient(width, 0, width - 120, 0) : ctx.createLinearGradient(0, 0, 120, 0)
  gutterGradient.addColorStop(0, 'rgba(0,0,0,.25)')
  gutterGradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gutterGradient
  ctx.fillRect(left ? width - 120 : 0, 0, 120, height)
  ctx.fillStyle = COLORS.darkGold
  ctx.font = `bold 32px ${FONT}`
  spacedText(ctx, 'GATRALOCA 58', width / 2, 82, 9)
  ctx.strokeStyle = COLORS.gold
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(90, 104)
  ctx.lineTo(width - 90, 104)
  ctx.stroke()

  for (let i = 0; i < 3; i++) {
    const student = students[pageIndex * 3 + i]
    if (!student) continue
    const top = 142 + i * 410
    const photoX = left ? 112 : 162
    const photoWidth = 252
    const photoHeight = 300
    const textX = photoX + photoWidth + 34
    const detailsWidth = 520
    const centerX = photoX + photoWidth / 2
    const photoGradient = ctx.createLinearGradient(photoX, top, photoX + photoWidth, top + photoHeight)
    photoGradient.addColorStop(0, '#2a5a44')
    photoGradient.addColorStop(1, '#12261c')
    ctx.fillStyle = photoGradient
    ctx.fillRect(photoX, top, photoWidth, photoHeight)
    if (student.img) {
      fitPhoto(ctx, student.img, photoX, top, photoWidth, photoHeight)
    } else {
      ctx.save()
      ctx.beginPath()
      ctx.rect(photoX, top, photoWidth, photoHeight)
      ctx.clip()
      ctx.fillStyle = 'rgba(243,239,227,.3)'
      ctx.beginPath()
      ctx.arc(centerX, top + 118, 50, 0, PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(centerX, top + 312, 100, 120, 0, 0, PI * 2)
      ctx.fill()
      ctx.restore()
    }
    ctx.strokeStyle = COLORS.gold
    ctx.lineWidth = 3
    ctx.strokeRect(photoX - 6, top - 6, photoWidth + 12, photoHeight + 12)
    ctx.lineWidth = 1.5
    ctx.strokeRect(photoX - 13, top - 13, photoWidth + 26, photoHeight + 26)
    ctx.textAlign = 'left'
    let fontSize = 48
    ctx.font = `bold ${fontSize}px ${FONT}`
    while (ctx.measureText(student.nama).width + student.nama.length * 1.2 > detailsWidth && fontSize > 24) {
      fontSize--
      ctx.font = `bold ${fontSize}px ${FONT}`
    }
    if (student.nama) {
      ctx.fillStyle = '#10291d'
      spacedTextLeft(ctx, student.nama, textX, top + 78, 1.2)
    }
    if (student.jurusan || student.kelas) {
      ctx.fillStyle = '#63450f'
      ctx.font = `bold 32px ${FONT}`
      spacedTextLeft(ctx, [student.jurusan, student.kelas !== student.jurusan ? student.kelas : ''].filter(Boolean).join(' · '), textX, top + 128, 1.4)
    }
    if (student.cita) {
      const quoteX = textX - 12
      const quoteY = top + 158
      const quoteWidth = detailsWidth
      const quoteHeight = 152
      ctx.fillStyle = '#fffdf5'
      ctx.fillRect(quoteX, quoteY, quoteWidth, quoteHeight)
      ctx.strokeStyle = '#8b6a2c'
      ctx.lineWidth = 3
      ctx.strokeRect(quoteX, quoteY, quoteWidth, quoteHeight)
      ctx.fillStyle = '#60420f'
      ctx.font = `bold 48px ${FONT}`
      ctx.fillText('“', textX + 4, top + 202)
      ctx.fillStyle = '#17291e'
      ctx.font = `bold 29px ${FONT}`
      drawWrappedText(ctx, student.cita, textX + 40, top + 202, quoteWidth - 66, 40)
    }
    ctx.fillStyle = '#63450f'
    ctx.font = `bold 24px ${FONT}`
    spacedText(ctx, 'GATRALOCA 58', textX + detailsWidth / 2, top + 354, 2)
    if (i < 2 && students[pageIndex * 3 + i + 1]) {
      ctx.strokeStyle = 'rgba(139,106,44,.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(photoX - 8, top + 390)
      ctx.lineTo(textX - 12 + detailsWidth, top + 390)
      ctx.stroke()
    }
  }
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.darkGold
  ctx.font = `bold 30px ${FONT}`
  ctx.fillText(`— ${pageIndex + 1} —`, width / 2, height - 52)
}

function createTexture(width, height, draw, flip = false) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const redraw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (flip) {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }
    draw(ctx, width, height)
    texture.needsUpdate = true
  }
  redraw()
  return { texture, redraw }
}

function createLeaf(width, height, frontTexture, backTexture, index, leafCount, options = {}) {
  const geometry = new THREE.PlaneGeometry(width, height, SEGMENTS, 1)
  const frontMaterial = new THREE.MeshStandardMaterial({ map: frontTexture, roughness: options.roughness || 0.85, side: THREE.FrontSide, bumpMap: options.bump ? frontTexture : null, bumpScale: 2 })
  const backMaterial = new THREE.MeshStandardMaterial({ map: backTexture, roughness: options.roughness || 0.85, side: THREE.BackSide })
  const front = new THREE.Mesh(geometry, frontMaterial)
  const back = new THREE.Mesh(geometry, backMaterial)
  front.frustumCulled = false
  back.frustumCulled = false
  const group = new THREE.Group()
  group.add(front, back)
  return {
    group,
    progress: 0,
    velocity: 0,
    target: 0,
    update() {
      const p = this.progress
      const sine = Math.sin(p * PI)
      const smooth = p * p * (3 - 2 * p)
      const z0 = (leafCount - index) * GAP
      const z1 = (index + 1) * GAP
      const zOffset = z0 + (z1 - z0) * smooth
      const segment = width / SEGMENTS
      const positions = geometry.attributes.position
      let x = 0
      let z = 0
      for (let j = 0; j <= SEGMENTS; j++) {
        if (j) {
          const angle = -PI * p + CURL * sine * ((j - 0.5) / SEGMENTS)
          x += segment * Math.cos(angle)
          z -= segment * Math.sin(angle)
        }
        positions.setXYZ(j, x, height / 2, z + zOffset)
        positions.setXYZ(SEGMENTS + 1 + j, x, -height / 2, z + zOffset)
      }
      positions.needsUpdate = true
      geometry.computeVertexNormals()
      const brightness = 1 - 0.38 * sine
      frontMaterial.color.setScalar(brightness)
      backMaterial.color.setScalar(brightness)
    },
  }
}

function radialTexture(color, alpha) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, `rgba(${color},${alpha})`)
  gradient.addColorStop(1, `rgba(${color},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

export default function YearbookPage() {
  const mountRef = useRef(null)
  const hintRef = useRef(null)
  const [students, setStudents] = useState([])
  const [loadError, setLoadError] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [rendererReady, setRendererReady] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [searchAttempt, setSearchAttempt] = useState(0)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    const term = search.trim()
    if (!term) return undefined

    let active = true
    const timer = window.setTimeout(() => {
      studentApi.list({ search: term, per_page: 8, page: searchPage })
        .then(({ data }) => {
          if (!active) return
          setSearchResults(current => searchPage === 1 ? data.data : [...current, ...data.data])
          setSearchTotal(data.total)
        })
        .catch(() => {
          if (active) setSearchError('Pencarian gagal dimuat. Coba lagi.')
        })
        .finally(() => {
          if (active) setSearching(false)
        })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [search, searchPage, searchAttempt])

  function handleSearchChange(event) {
    const value = event.target.value
    setSearch(value)
    setSearchResults([])
    setSearchTotal(0)
    setSearchError('')
    setSearchPage(1)
    setSearchAttempt(0)
    setSearching(Boolean(value.trim()))
  }

  useEffect(() => {
    let active = true
    studentApi.list({ per_page: 100 })
      .then(async ({ data }) => {
        const remainingPages = Array.from({ length: data.last_page - 1 }, (_, index) => index + 2)
        const otherPages = await Promise.all(remainingPages.map(page => studentApi.list({ per_page: 100, page })))
        if (active) {
          setRendererReady(false)
          setStudents([...data.data, ...otherPages.flatMap(page => page.data.data)])
          setStudentsLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('Data buku kenangan tidak dapat dimuat.')
          setStudentsLoading(false)
        }
      })
    return () => { active = false }
  }, [loadAttempt])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    const bookStudents = students.length ? makeStudents(students) : makeMockStudents()
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      if (hintRef.current) hintRef.current.textContent = 'Browser ini tidak mendukung WebGL.'
      const frame = window.requestAnimationFrame(() => setRendererReady(true))
      return () => window.cancelAnimationFrame(frame)
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    const textures = []
    const redraws = []
    const make = (w, h, draw, flip = false) => {
      const result = createTexture(w, h, draw, flip)
      textures.push(result.texture)
      redraws.push(result.redraw)
      return result.texture
    }
    const coverFront = make(1024, 1468, (ctx, w, h) => drawCover(ctx, w, h, null))
    const coverBack = make(1024, 1468, (ctx, w, h) => drawBoard(ctx, w, h, true, ['Hari ini kita berpisah,', 'tetapi cerita kita', 'akan selalu pulang.'], 'GATRALOCA 58'), true)
    const backBoard = make(1024, 1468, (ctx, w, h) => drawBoard(ctx, w, h, false, ['Sampai jumpa,', 'teman seperjalanan.'], 'KENANGAN INI SELALU PULANG'))
    const neededPages = Math.ceil(bookStudents.length / 3)
    const pageCount = Math.max(2, neededPages + (neededPages % 2))
    const pageRedrawStart = redraws.length
    const pages = Array.from({ length: pageCount }, (_, index) => make(
      512,
      717,
      (ctx, w, h) => {
        ctx.scale(w / 1024, h / 1434)
        drawStudentPage(ctx, 1024, 1434, index, index % 2 === 1, bookStudents)
      },
      index % 2 === 1,
    ))
    const pageRedraws = redraws.slice(pageRedrawStart)
    const photoImages = []

    const root = new THREE.Group()
    const book = new THREE.Group()
    root.add(book)
    scene.add(root)
    const leafCount = 1 + pages.length / 2
    const leaves = [
      createLeaf(BW, BH, coverFront, coverBack, 0, leafCount, { bump: true, roughness: 0.5 }),
      ...Array.from({ length: pages.length / 2 }, (_, index) =>
        createLeaf(W, H, pages[index * 2], pages[index * 2 + 1], index + 1, leafCount)
      ),
    ]
    leaves.forEach(leaf => book.add(leaf.group))
    const base = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshStandardMaterial({ map: backBoard, roughness: 0.8 }))
    base.position.x = BW / 2
    book.add(base)
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.08, BH, leafCount * GAP + 0.04), new THREE.MeshStandardMaterial({ color: 0x16301f, roughness: 0.55 }))
    spine.position.set(-0.03, 0, leafCount * GAP / 2)
    book.add(spine)

    const shadowTexture = radialTexture('0,0,0', 0.7)
    const particleTexture = radialTexture('200,164,92', 1)
    textures.push(shadowTexture, particleTexture)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2 * BW + 0.9, BH + 1), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }))
    shadow.position.z = -0.2
    book.add(shadow)

    scene.add(new THREE.AmbientLight(0xf3efe3, 0.55))
    const directionalLight = new THREE.DirectionalLight(0xfff1d6, 0.85)
    directionalLight.position.set(2, 3, 5)
    scene.add(directionalLight)
    const rimLight = new THREE.PointLight(0x2f8a5f, 0.9, 14)
    rimLight.position.set(-4, -2, 3)
    scene.add(rimLight)
    const movingLight = new THREE.PointLight(0xffd27a, 1.1, 12)
    movingLight.position.z = 2.6
    scene.add(movingLight)

    const particleCount = 140
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = []
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6
      particlePositions[i * 3 + 2] = Math.random() * 3 - 0.5
      particleSpeeds.push(0.002 + Math.random() * 0.004)
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ size: 0.09, map: particleTexture, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })))

    const hints = ['Klik buku untuk membukanya', 'Klik untuk membalik halaman', 'Klik untuk menutup buku']
    let state = 0
    let open = 0
    let openVelocity = 0
    let openTarget = 0
    let kick = 0
    let mouseX = 0
    let mouseY = 0
    let easedX = 0
    let easedY = 0
    let closedScale = 1
    let accumulator = 0
    let pointerDown = null
    let disposed = false
    let animationFrame = 0
    const timers = new Set()
    const loadedPhotoPages = new Set()
    let readyMarked = false
    const hint = hintRef.current
    if (hint) hint.textContent = hints[0]

    const loadPagePhotos = pageIndex => {
      if (loadedPhotoPages.has(pageIndex)) return
      loadedPhotoPages.add(pageIndex)
      bookStudents.slice(pageIndex * 3, pageIndex * 3 + 3).forEach(student => {
        if (!student?.photoUrl) return
        const image = new Image()
        photoImages.push(image)
        image.crossOrigin = 'anonymous'
        image.onload = () => {
          if (disposed) return
          student.img = image
          pageRedraws[pageIndex]?.()
        }
        image.onerror = () => {
          if (!disposed && hintRef.current) hintRef.current.textContent = 'Sebagian foto buku kenangan tidak dapat dimuat.'
        }
        image.src = student.photoUrl
      })
    }

    const schedule = (callback, ms) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (!disposed) callback()
      }, ms)
      timers.add(timer)
    }
    const advance = () => {
      state = state === leaves.length ? 0 : state + 1
      if (state === 0) {
        leaves.slice().reverse().forEach((leaf, order) => schedule(() => { leaf.target = 0 }, order * 120))
        schedule(() => { openTarget = 0 }, 380)
      } else {
        leaves[state - 1].target = 1
        openTarget = 1
        if (state > 1) {
          const firstPage = (state - 2) * 2
          loadPagePhotos(firstPage)
          loadPagePhotos(firstPage + 1)
        }
      }
      if (hint) hint.textContent = state === 0
        ? hints[0]
        : state === leaves.length
          ? hints[2]
          : hints[1]
      kick = 1
    }
    const onPointerDown = event => { pointerDown = [event.clientX, event.clientY] }
    const onPointerUp = event => {
      if (pointerDown && Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) < 8) advance()
      pointerDown = null
    }
    const onKeyDown = event => {
      if ([' ', 'Enter', 'ArrowRight'].includes(event.key)) {
        event.preventDefault()
        advance()
      }
    }
    const onPointerMove = event => {
      const bounds = renderer.domElement.getBoundingClientRect()
      mouseX = (event.clientX - bounds.left) / bounds.width - 0.5
      mouseY = (event.clientY - bounds.top) / bounds.height - 0.5
    }
    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      const aspect = width / height
      const tangent = Math.tan(35 * PI / 360)
      renderer.setSize(width, height)
      camera.aspect = aspect
      const distanceHeight = 1.95 / tangent
      const distanceWideOpen = (2 * BW + 0.4) / 2 / (tangent * aspect)
      const distanceWideClosed = (BW + 0.6) / 2 / (tangent * aspect)
      const distance = Math.max(distanceHeight, distanceWideOpen)
      closedScale = Math.min(1.7, distance / Math.max(distanceHeight, distanceWideClosed))
      camera.position.z = distance
      camera.updateProjectionMatrix()
    }
    const step = () => {
      for (const leaf of leaves) {
        leaf.velocity += (leaf.target - leaf.progress) * 0.02
        leaf.velocity *= 0.8
        leaf.progress = Math.min(1, Math.max(0, leaf.progress + leaf.velocity))
      }
      openVelocity += (openTarget - open) * 0.02
      openVelocity *= 0.8
      open += openVelocity
      kick *= 0.92
    }
    const clock = new THREE.Clock()
    const renderFrame = () => {
      animationFrame = window.requestAnimationFrame(renderFrame)
      const delta = Math.min(clock.getDelta(), 0.05)
      const time = clock.elapsedTime
      accumulator += delta * 60
      while (accumulator >= 1) {
        step()
        accumulator--
      }
      leaves.forEach(leaf => leaf.update())
      const openAmount = open
      const clampedOpen = Math.min(1, Math.max(0, openAmount))
      book.position.x = -W / 2 * (1 - openAmount)
      shadow.position.x = W / 2 * (1 - openAmount)
      shadow.scale.x = 0.55 + 0.45 * clampedOpen
      easedX += (mouseX - easedX) * 0.06
      easedY += (mouseY - easedY) * 0.06
      root.rotation.set(-0.5 + easedY * 0.12 + kick * 0.03, easedX * 0.3, -easedX * 0.04)
      root.scale.setScalar(closedScale + (1 - closedScale) * clampedOpen + kick * 0.03)
      root.position.z = kick * 0.25
      movingLight.position.x = Math.sin(time * 0.9) * 3.2
      movingLight.position.y = Math.cos(time * 0.6) * 1.6 + 0.4
      const positions = particleGeometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        let y = positions.getY(i) + particleSpeeds[i]
        if (y > 3) y = -3
        positions.setY(i, y)
        positions.setX(i, positions.getX(i) + Math.sin(time + i) * 0.0008)
      }
      positions.needsUpdate = true
      renderer.render(scene, camera)
      if (!readyMarked) {
        readyMarked = true
        setRendererReady(true)
      }
    }

    renderer.domElement.tabIndex = 0
    renderer.domElement.setAttribute('aria-label', 'Buku kenangan 3D, tekan Enter atau klik untuk membalik halaman')
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('keydown', onKeyDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()
    renderFrame()

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      timers.forEach(timer => window.clearTimeout(timer))
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('keydown', onKeyDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      scene.traverse(object => {
        object.geometry?.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.filter(Boolean).forEach(material => material.dispose())
      })
      textures.forEach(texture => texture.dispose())
      photoImages.forEach(image => {
        image.onload = null
        image.onerror = null
        image.src = ''
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [students])

  return (
    <section className="yearbook3d-page">
      <header className="yearbook3d-heading">
        <p className="eyebrow">04 / Jejak yang tak pernah benar-benar pergi</p>
        <h2>Buku kenangan <em>3D</em></h2>
        <p className="description">Tiga tahun mungkin terasa singkat, tetapi tawa, perjuangan, dan persahabatan kita akan tinggal lebih lama. Bukalah halaman demi halaman untuk kembali menyapa setiap cerita.</p>
        <p className="yearbook3d-total">{studentsLoading
          ? 'Mengumpulkan kisah seluruh angkatan…'
          : students.length === 0
            ? 'Belum ada data siswa · menampilkan mockup'
            : `${students.length >= 600 ? '600+ siswa · ' : ''}${students.length} kisah dalam satu angkatan`}</p>
        <div className="yearbook-search">
          <label htmlFor="yearbook-search-input">Temukan teman seperjalanan</label>
          <div className="yearbook-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
            <input
              id="yearbook-search-input"
              type="search"
              autoComplete="off"
              placeholder="Cari nama, jurusan, atau kelas..."
              value={search}
              onChange={handleSearchChange}
              aria-controls="yearbook-search-results"
              aria-expanded={Boolean(search.trim())}
              aria-describedby={search.trim() ? 'yearbook-search-results' : undefined}
            />
            {search && <button type="button" onClick={() => {
              setSearch('')
              setSearchResults([])
              setSearchTotal(0)
              setSearching(false)
              setSearchError('')
              setSearchPage(1)
            }} aria-label="Hapus pencarian">×</button>}
          </div>
          {search.trim() && (
            <div className="yearbook-search-results" id="yearbook-search-results" role="region" aria-live="polite" aria-busy={searching}>
              <p className="yearbook-search-count">
                {searching ? 'Mencari cerita…' : searchError || `${searchResults.length} dari ${searchTotal} teman`}
              </p>
              {searching && (
                <div className="yearbook-search-skeletons" role="status" aria-label="Memuat hasil pencarian">
                  {Array.from({ length: 4 }, (_, index) => <span className="yearbook-search-skeleton" key={index} />)}
                </div>
              )}
              {!searching && !searchError && searchResults.map(student => (
                <button className="yearbook-search-result" key={student.id} type="button" onClick={() => setSelectedStudent(student)}>
                  {student.photo_url
                    ? <img src={student.photo_url} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true }} />
                    : <span className="yearbook-search-avatar">{student.name.slice(0, 1)}</span>}
                  <span><strong>{student.name}</strong><small>{student.major}{student.kelas ? ` · ${student.kelas}` : ''}</small></span>
                  <b aria-hidden="true">↗</b>
                </button>
              ))}
              {!searching && !searchError && searchTotal === 0 && (
                <p className="yearbook-search-more">Belum ada teman yang cocok. Coba nama atau jurusan lain.</p>
              )}
              {!searching && searchError && (
                <button className="yearbook-search-load-more" type="button" onClick={() => {
                  setSearching(true)
                  setSearchAttempt(attempt => attempt + 1)
                }}>Coba pencarian lagi</button>
              )}
              {!searching && !searchError && searchResults.length < searchTotal && (
                <button className="yearbook-search-load-more" type="button" onClick={() => {
                  setSearching(true)
                  setSearchPage(page => page + 1)
                }}>
                  Tampilkan siswa lainnya
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      <div className="yearbook3d-stage" aria-busy={studentsLoading || !rendererReady}>
        <div className="yearbook3d-canvas" ref={mountRef} />
        <div className="yearbook3d-brand">GATRALOCA</div>
        {(studentsLoading || !rendererReady) && (
          <div className="yearbook-stage-loading" role="status">
            <span className="yearbook-stage-spinner" />
            <strong>{studentsLoading ? 'Mengumpulkan cerita setiap teman…' : 'Membuka kembali buku kenangan…'}</strong>
            <small>Setiap nama menyimpan cerita yang berarti.</small>
          </div>
        )}
      </div>
      <div className="yearbook3d-hint">
        <span ref={hintRef} />
        {loadError
          ? <small className="yearbook-load-error">{loadError} <button type="button" onClick={() => {
            setLoadError('')
            setStudentsLoading(true)
            setRendererReady(false)
            setLoadAttempt(attempt => attempt + 1)
          }}>Coba lagi</button></small>
          : <small>{students.length === 0
            ? 'Ini hanya contoh tampilan. Tambahkan profil siswa agar buku berisi kenangan angkatan yang sebenarnya.'
            : 'Satu halaman, tiga teman, dan kenangan yang akan selalu kita bawa.'}</small>}
      </div>
      {selectedStudent && (
        <div className="modal-overlay" onClick={event => event.target === event.currentTarget && setSelectedStudent(null)}>
          <div className="modal-content yearbook-student-modal" role="dialog" aria-modal="true" aria-labelledby="yearbook-student-name">
            <button className="close-modal" type="button" onClick={() => setSelectedStudent(null)}>Tutup ✕</button>
            {selectedStudent.photo_url
              ? <img className="yearbook-student-photo" src={selectedStudent.photo_url} alt={`Foto ${selectedStudent.name}`} />
              : <div className="yearbook-student-photo yearbook-student-photo-empty">{selectedStudent.name.slice(0, 1)}</div>}
            <p className="eyebrow">Teman seperjalanan · GATRALOCA 58</p>
            <h2 id="yearbook-student-name">{selectedStudent.name}</h2>
            <p className="yearbook-student-major">{selectedStudent.major}{selectedStudent.kelas ? ` · ${selectedStudent.kelas}` : ''}</p>
            {selectedStudent.quote && <blockquote>{selectedStudent.quote}</blockquote>}
          </div>
        </div>
      )}
    </section>
  )
}

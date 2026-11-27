/*
 * @description: 心愿岛 Three.js 场景 — 浮岛 + 成长树 + 柔和粒子
 */
import * as THREE from 'three'
import { CoverMood, getMoodMeta } from '@/types/lifeGoal'

export type IslandWorldOptions = {
  el: HTMLElement
  mode: 'sky' | 'focus'
  progress?: number
  mood?: CoverMood
  /** sky 模式下多岛进度 0-1 */
  islands?: Array<{ progress: number; mood: CoverMood; id: string }>
  onIslandClick?: (id: string) => void
}

type IslandHandle = {
  id: string
  root: THREE.Group
  tree: THREE.Group
  progress: number
  mood: CoverMood
}

export class IslandWorld {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private clock = new THREE.Clock()
  private raf = 0
  private disposed = false
  private islands: IslandHandle[] = []
  private particles: THREE.Points | null = null
  private cloudGroup = new THREE.Group()
  private options: IslandWorldOptions
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private resizeObs: ResizeObserver | null = null

  constructor(options: IslandWorldOptions) {
    this.options = options
    const { el } = options
    const w = el.clientWidth || 375
    const h = el.clientHeight || 500

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0xe8f4f8, 0.022)

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100)
    if (options.mode === 'sky') {
      this.camera.position.set(0, 3.2, 9.5)
      this.camera.lookAt(0, 0.4, 0)
    } else {
      this.camera.position.set(0, 2.4, 5.2)
      this.camera.lookAt(0, 0.6, 0)
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(w, h)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(this.renderer.domElement)

    this.setupLights()
    this.setupSkyBackdrop()
    this.setupClouds()
    this.setupParticles()

    if (options.mode === 'sky') {
      const list = options.islands || []
      if (list.length === 0) {
        this.addEmptyHintIsland()
      } else {
        list.forEach((item, i) => {
          const x = (i - (list.length - 1) / 2) * 2.6
          this.spawnIsland(item.id, item.mood, item.progress, x, 0, 0)
        })
      }
    } else {
      this.spawnIsland(
        'focus',
        options.mood || 'mint',
        options.progress || 0,
        0,
        0,
        0
      )
    }

    el.addEventListener('pointerdown', this.onPointerDown)
    this.resizeObs = new ResizeObserver(() => this.resize())
    this.resizeObs.observe(el)
    this.animate()
  }

  private setupLights() {
    const hemi = new THREE.HemisphereLight(0xfff6f0, 0xb8d4c8, 0.95)
    this.scene.add(hemi)
    const sun = new THREE.DirectionalLight(0xfff2e0, 0.85)
    sun.position.set(4, 8, 3)
    this.scene.add(sun)
    const fill = new THREE.DirectionalLight(0xc5e8ff, 0.35)
    fill.position.set(-3, 2, -2)
    this.scene.add(fill)
  }

  private setupSkyBackdrop() {
    // soft gradient plane far behind
    const geo = new THREE.SphereGeometry(28, 32, 16)
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top: { value: new THREE.Color(0xd8eff8) },
        mid: { value: new THREE.Color(0xeef7f4) },
        bot: { value: new THREE.Color(0xf8f3ea) },
      },
      vertexShader: `
        varying vec3 vPos;
        void main(){
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
        varying vec3 vPos;
        void main(){
          float h = normalize(vPos).y * 0.5 + 0.5;
          vec3 c = mix(bot, mid, smoothstep(0.0,0.45,h));
          c = mix(c, top, smoothstep(0.45,1.0,h));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    })
    this.scene.add(new THREE.Mesh(geo, mat))
  }

  private setupClouds() {
    this.cloudGroup = new THREE.Group()
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.72,
    })
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group()
      const sizes = [0.55, 0.4, 0.35]
      sizes.forEach((s, j) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 12), mat)
        m.position.set(j * 0.35 - 0.35, (j % 2) * 0.1, (j - 1) * 0.15)
        g.add(m)
      })
      g.position.set(
        (Math.random() - 0.5) * 12,
        1.8 + Math.random() * 2.2,
        -2 - Math.random() * 6
      )
      g.userData.speed = 0.05 + Math.random() * 0.08
      g.userData.baseY = g.position.y
      this.cloudGroup.add(g)
    }
    this.scene.add(this.cloudGroup)
  }

  private setupParticles() {
    const count = 80
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
    this.particles = new THREE.Points(geo, mat)
    this.scene.add(this.particles)
  }

  private addEmptyHintIsland() {
    const root = new THREE.Group()
    const soil = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: 0xd4ebe0,
        roughness: 0.75,
        transparent: true,
        opacity: 0.85,
      })
    )
    soil.scale.set(1.5, 0.52, 1.5)
    root.add(soil)

    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 28),
      new THREE.MeshStandardMaterial({
        color: 0xa8dcc0,
        roughness: 1,
        flatShading: true,
        transparent: true,
        opacity: 0.9,
      })
    )
    grass.rotation.x = -Math.PI / 2
    grass.position.y = 0.24
    root.add(grass)

    // floating seed
    const seed = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xf0d878,
        emissive: 0xe8c96a,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      })
    )
    seed.position.y = 0.85
    root.add(seed)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.025, 8, 40),
      new THREE.MeshBasicMaterial({
        color: 0x7bc9a6,
        transparent: true,
        opacity: 0.65,
      })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.85
    root.add(ring)

    const glow = new THREE.Mesh(
      new THREE.RingGeometry(1.35, 1.75, 48),
      new THREE.MeshBasicMaterial({
        color: 0x7bc9a6,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      })
    )
    glow.rotation.x = -Math.PI / 2
    glow.position.y = -0.4
    root.add(glow)

    root.position.set(0, 0, 0)
    root.userData.baseY = 0
    root.userData.phase = 0
    this.scene.add(root)
    this.islands.push({
      id: '__empty',
      root,
      tree: new THREE.Group(),
      progress: 0,
      mood: 'mint',
    })
  }

  private spawnIsland(
    id: string,
    mood: CoverMood,
    progress: number,
    x: number,
    y: number,
    z: number
  ) {
    const meta = getMoodMeta(mood)
    const root = new THREE.Group()
    root.position.set(x, y, z)
    root.userData.islandId = id

    // island body
    const soilMat = new THREE.MeshStandardMaterial({
      color: meta.soil,
      roughness: 0.85,
      metalness: 0.05,
    })
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      soilMat
    )
    top.scale.set(1.35, 0.5, 1.35)
    root.add(top)

    const dirt = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 1 })
    )
    dirt.scale.set(1.25, 0.7, 1.25)
    dirt.position.y = -0.05
    root.add(dirt)

    // soft grass discs
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 24),
      new THREE.MeshStandardMaterial({
        color: meta.leaf,
        roughness: 1,
        flatShading: true,
      })
    )
    grass.rotation.x = -Math.PI / 2
    grass.position.y = 0.22
    root.add(grass)

    // tiny rocks
    for (let i = 0; i < 3; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06, 0),
        new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 0.9 })
      )
      rock.position.set(
        Math.cos((i / 3) * Math.PI * 2) * 0.7,
        0.28,
        Math.sin((i / 3) * Math.PI * 2) * 0.55
      )
      root.add(rock)
    }

    const tree = this.buildTree(progress, meta.leaf, meta.color)
    tree.position.y = 0.22
    root.add(tree)

    // glow ring under island
    const glow = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.55, 40),
      new THREE.MeshBasicMaterial({
        color: meta.color,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    )
    glow.rotation.x = -Math.PI / 2
    glow.position.y = -0.35
    root.add(glow)

    root.userData.baseY = y
    root.userData.phase = Math.random() * Math.PI * 2
    this.scene.add(root)
    this.islands.push({ id, root, tree, progress, mood })
  }

  private buildTree(progress: number, leafColor: number, accentHex: string) {
    const tree = new THREE.Group()
    const p = Math.max(0, Math.min(100, progress)) / 100

    const trunkH = 0.15 + p * 0.85
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.07, trunkH, 8),
      new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.8 })
    )
    trunk.position.y = trunkH / 2
    tree.add(trunk)

    if (p < 0.08) {
      // seed only
      const seed = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xe8d48a })
      )
      seed.position.y = 0.1
      tree.add(seed)
      return tree
    }

    const canopy = new THREE.Group()
    canopy.position.y = trunkH
    const layers = p < 0.35 ? 1 : p < 0.65 ? 2 : 3
    for (let i = 0; i < layers; i++) {
      const r = 0.22 + p * 0.45 - i * 0.08
      const leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 0),
        new THREE.MeshStandardMaterial({
          color: leafColor,
          roughness: 0.7,
          flatShading: true,
        })
      )
      leaf.position.y = i * 0.22
      leaf.rotation.y = i * 0.6
      canopy.add(leaf)
    }

    // blossoms when blooming
    if (p >= 0.65) {
      const accent = new THREE.Color(accentHex)
      for (let i = 0; i < 8; i++) {
        const blossom = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshStandardMaterial({
            color: accent,
            emissive: accent,
            emissiveIntensity: 0.25,
            roughness: 0.5,
          })
        )
        const a = (i / 8) * Math.PI * 2
        blossom.position.set(Math.cos(a) * 0.35, 0.15 + (i % 3) * 0.1, Math.sin(a) * 0.35)
        canopy.add(blossom)
      }
    }

    // sparkles when nearly done
    if (p >= 0.9) {
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        new THREE.MeshStandardMaterial({
          color: 0xfff2a8,
          emissive: 0xffe08a,
          emissiveIntensity: 0.6,
        })
      )
      star.position.y = 0.55 + p * 0.2
      canopy.add(star)
    }

    tree.add(canopy)
    tree.userData.canopy = canopy
    return tree
  }

  updateFocusProgress(progress: number, mood?: CoverMood) {
    if (this.options.mode !== 'focus' || !this.islands[0]) return
    const island = this.islands[0]
    island.root.remove(island.tree)
    const meta = getMoodMeta(mood || island.mood)
    const tree = this.buildTree(progress, meta.leaf, meta.color)
    tree.position.y = 0.22
    island.root.add(tree)
    island.tree = tree
    island.progress = progress
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.options.onIslandClick || this.options.mode !== 'sky') return
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(
      this.islands.map((i) => i.root),
      true
    )
    if (hits.length) {
      let obj: THREE.Object3D | null = hits[0].object
      while (obj && !obj.userData.islandId) obj = obj.parent
      const id = obj?.userData.islandId
      if (id && id !== '__empty') this.options.onIslandClick(id)
    }
  }

  private resize = () => {
    const el = this.options.el
    const w = el.clientWidth || 1
    const h = el.clientHeight || 1
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  private animate = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.animate)
    const t = this.clock.getElapsedTime()

    this.islands.forEach((island, idx) => {
      const phase = island.root.userData.phase || 0
      const baseY = island.root.userData.baseY || 0
      island.root.position.y = baseY + Math.sin(t * 0.7 + phase) * 0.12
      island.root.rotation.y = Math.sin(t * 0.25 + idx) * 0.08
      const canopy = island.tree.userData.canopy as THREE.Group | undefined
      if (canopy) canopy.rotation.y = t * 0.15
    })

    this.cloudGroup.children.forEach((c) => {
      c.position.x += (c.userData.speed || 0.05) * 0.016
      if (c.position.x > 8) c.position.x = -8
      c.position.y = c.userData.baseY + Math.sin(t * 0.4 + c.position.x) * 0.08
    })

    if (this.particles) {
      this.particles.rotation.y = t * 0.02
      const pos = this.particles.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i) + 0.004
        pos.setY(i, y > 5 ? 0 : y)
      }
      pos.needsUpdate = true
    }

    if (this.options.mode === 'focus') {
      this.camera.position.x = Math.sin(t * 0.2) * 0.35
      this.camera.lookAt(0, 0.7, 0)
    } else {
      this.camera.position.x = Math.sin(t * 0.12) * 0.4
      this.camera.lookAt(0, 0.4, 0)
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.options.el.removeEventListener('pointerdown', this.onPointerDown)
    this.resizeObs?.disconnect()
    this.renderer.dispose()
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
  }
}

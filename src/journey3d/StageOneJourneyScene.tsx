import { useEffect, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping, BoxGeometry, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  CylinderGeometry, DirectionalLight, DodecahedronGeometry, DoubleSide, Float32BufferAttribute,
  FogExp2, Group, HemisphereLight, IcosahedronGeometry, MathUtils, Mesh, MeshToonMaterial,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, SphereGeometry,
  SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three/src/Three.js'
import type { JourneySceneContracts } from './journeyContracts'
import { sampleSurfaceHeightKm } from './islandTerrainSurface'
import { SCENE_UNITS_PER_KM, scenePointToGeographic, STAGE_ONE_TWO_CONTINUOUS_ROUTE } from './stageTwoRouteV2'

const THREE = {
  ACESFilmicToneMapping, BoxGeometry, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  CylinderGeometry, DirectionalLight, DodecahedronGeometry, DoubleSide, Float32BufferAttribute,
  FogExp2, Group, HemisphereLight, IcosahedronGeometry, MathUtils, Mesh, MeshToonMaterial,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, SphereGeometry,
  SRGBColorSpace, Vector3, WebGLRenderer,
}

export type StageOneJourneySceneProps = JourneySceneContracts & {
  journeyProgress: number
  isTyping: boolean
  typingPace: number
  reducedMotion?: boolean
}

type LiveInput = Omit<StageOneJourneySceneProps, 'reducedMotion'> & { reducedMotion: boolean }

export function StageOneJourneyScene(props: StageOneJourneySceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<LiveInput>({ ...props, reducedMotion: props.reducedMotion ?? false })
  const [failed, setFailed] = useState(false)
  liveRef.current = { ...props, reducedMotion: props.reducedMotion ?? false }

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      setFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.04
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.id = 'journey-world-canvas'
    renderer.domElement.dataset.worldSource = 'kotoba-island-route-v2'
    host.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xbad7d0)
    scene.fog = new THREE.FogExp2(0xaac7b8, 0.011)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.08, 180)
    const hemi = new THREE.HemisphereLight(0xfff5cf, 0x476b53, 2)
    const sun = new THREE.DirectionalLight(0xffe8a8, 3.1)
    sun.position.set(-18, 28, 18)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -24
    sun.shadow.camera.right = 24
    sun.shadow.camera.top = 24
    sun.shadow.camera.bottom = -24
    sun.shadow.camera.far = 85
    scene.add(hemi, sun)

    let seed = 872341
    const random = () => ((seed = Math.imul(seed ^ seed >>> 15, 1 | seed)) + (seed ^ seed >>> 7) >>> 0) / 4294967296
    const clampWorldProgress = (value: number) => Math.min(2, Math.max(0, Number.isFinite(value) ? value : 0))
    const clampRouteProgress = (value: number) => Math.min(2.2, Math.max(0, Number.isFinite(value) ? value : 0))
    const route = new THREE.CatmullRomCurve3(STAGE_ONE_TWO_CONTINUOUS_ROUTE.map(({ sceneX, sceneZ }) => new THREE.Vector3(sceneX, 0, sceneZ)), false, 'catmullrom', 0.32)
    // 11 spline segments: five per playable stage plus one Stage 3 proxy.
    const routeParameter = (s: number) => clampRouteProgress(s) * 5 / 11
    const point = (s: number) => route.getPoint(routeParameter(s))
    const tangent = (s: number) => route.getTangent(routeParameter(s)).normalize()
    const rightAt = (s: number) => { const t = tangent(s); return new THREE.Vector3(-t.z, 0, t.x).normalize() }
    const height = (x: number, z: number) => {
      const geographic = scenePointToGeographic(x, z)
      const backboneHeight = (sampleSurfaceHeightKm(geographic.latitudeDeg, geographic.longitudeDeg) - .08) * SCENE_UNITS_PER_KM
      const corridorMicroRelief = .12 * Math.sin(x * .17 + z * .035) + .06 * Math.sin(z * .09) - .04 * Math.cos(x * .35 - z * .025)
      return backboneHeight + corridorMicroRelief
    }
    const widthAt = (s: number) => THREE.MathUtils.lerp(2.35, 1.55, THREE.MathUtils.smoothstep(s, 0.1, 0.62))

    const makeTexture = (base: string, spots: string[], seedValue: number) => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 256
      const context = canvas.getContext('2d')
      if (!context) return null
      context.fillStyle = base
      context.fillRect(0, 0, 256, 256)
      let localSeed = seedValue
      const localRandom = () => ((localSeed = Math.imul(localSeed ^ localSeed >>> 15, 1 | localSeed)) + (localSeed ^ localSeed >>> 7) >>> 0) / 4294967296
      for (let i = 0; i < 110; i += 1) {
        context.globalAlpha = 0.025 + localRandom() * 0.08
        context.fillStyle = spots[Math.floor(localRandom() * spots.length)]
        context.beginPath()
        context.ellipse(localRandom() * 256, localRandom() * 256, 8 + localRandom() * 42, 5 + localRandom() * 28, localRandom() * Math.PI, 0, Math.PI * 2)
        context.fill()
      }
      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    }
    const groundTexture = makeTexture('#78965b', ['#9ab56b', '#607e52', '#c2b269', '#5b7751'], 41)
    const trailTexture = makeTexture('#91825a', ['#aa9869', '#6f754c', '#b8a97b', '#667448'], 72)
    groundTexture?.repeat.set(10, 44)
    trailTexture?.repeat.set(1.2, 32)
    const groundMaterial = new THREE.MeshToonMaterial({ map: groundTexture, color: 0xcbd7a1 })
    const trailMaterial = new THREE.MeshToonMaterial({ map: trailTexture, color: 0xbba876, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4 })
    const terrain = new THREE.Mesh(new THREE.PlaneGeometry(230, 390, 100, 190).rotateX(-Math.PI / 2), groundMaterial)
    terrain.position.set(-35, 0, -150)
    const terrainPositions = terrain.geometry.attributes.position
    for (let i = 0; i < terrainPositions.count; i += 1) {
      const x = terrainPositions.getX(i) - 35, z = terrainPositions.getZ(i) - 150
      terrainPositions.setY(i, height(x, z))
    }
    terrain.geometry.computeVertexNormals()
    terrain.receiveShadow = true
    scene.add(terrain)

    const ribbonVertices: number[] = [], ribbonUvs: number[] = [], ribbonIndices: number[] = []
    const ribbonSteps = 440
    for (let i = 0; i <= ribbonSteps; i += 1) {
      const s = i / ribbonSteps * 2.18, p = point(s), r = rightAt(s), w = widthAt(Math.min(1, s)) / 2 * (0.88 + 0.08 * Math.sin(s * 91))
      for (const side of [-1, 1]) {
        const x = p.x + r.x * w * side, z = p.z + r.z * w * side
        ribbonVertices.push(x, height(x, z) + 0.075, z)
        ribbonUvs.push(side < 0 ? 0 : 1, s * 30)
      }
      if (i < ribbonSteps) { const a = i * 2; ribbonIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
    }
    const ribbonGeometry = new THREE.BufferGeometry()
    ribbonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ribbonVertices, 3))
    ribbonGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(ribbonUvs, 2))
    ribbonGeometry.setIndex(ribbonIndices)
    ribbonGeometry.computeVertexNormals()
    const trail = new THREE.Mesh(ribbonGeometry, trailMaterial)
    trail.receiveShadow = true
    scene.add(trail)

    const trunkMaterial = new THREE.MeshToonMaterial({ color: 0x765438 })
    const leafMaterials = [0x456f46, 0x668c4e, 0x819951].map((color) => new THREE.MeshToonMaterial({ color }))
    const shrubMaterial = new THREE.MeshToonMaterial({ color: 0x52794a })
    const fernMaterial = new THREE.MeshToonMaterial({ color: 0x789858, side: THREE.DoubleSide })
    const rockMaterial = new THREE.MeshToonMaterial({ color: 0x6f7861 })
    const mossMaterial = new THREE.MeshToonMaterial({ color: 0x769052 })
    const woodMaterial = new THREE.MeshToonMaterial({ color: 0x8e6845 })
    const waterMaterial = new THREE.MeshToonMaterial({ color: 0x47a6a0, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    const trunkGeometry = new THREE.CylinderGeometry(0.55, 0.88, 7, 7, 3)
    const canopyGeometry = new THREE.IcosahedronGeometry(2, 1)
    const shrubGeometry = new THREE.IcosahedronGeometry(1, 1)
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0)
    const tree = (scale = 1, tone = 0) => {
      const group = new THREE.Group()
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
      trunk.position.y = 3.4; trunk.castShadow = true; group.add(trunk)
      ;[[-1.15, 7.1, 0], [0.8, 7.6, 0.15], [0.15, 8.55, -0.35], [1.45, 6.9, -0.5]].forEach((offset, index) => {
        const crown = new THREE.Mesh(canopyGeometry, leafMaterials[(tone + (index === 2 ? 1 : 0)) % leafMaterials.length])
        crown.position.set(...offset); crown.scale.set(1.15 + index * 0.06, 0.72, 0.95); crown.rotation.set(random(), random(), random()); crown.castShadow = true; group.add(crown)
      })
      group.scale.setScalar(scale)
      return group
    }
    const place = (object: any, s: number, offset: number, yOffset = 0, rotation = 0) => {
      const p = point(s), r = rightAt(s)
      object.position.set(p.x + r.x * offset, 0, p.z + r.z * offset)
      object.position.y = height(object.position.x, object.position.z) + yOffset
      object.rotation.y = Math.atan2(tangent(s).x, tangent(s).z) + rotation
      scene.add(object)
    }
    for (let i = 0; i < 132; i += 1) {
      const s = 0.18 + random() * 0.79, side = i % 2 ? 1 : -1
      const layer = i % 4, scale = 0.48 + random() * 0.52
      const offset = side * (widthAt(s) / 2 + 1 + scale * 0.8 + layer * 3.2 + random() * 2.8)
      place(tree(scale, i % 5), s, offset, 0, (random() - 0.5) * 0.55)
    }
    place(tree(1.4), 0.37, -3, 0, 0.18)
    place(tree(1.28), 0.53, -2.05, 0, -0.08)
    place(tree(1.22, 1), 0.565, 2, 0, 0.12)
    for (let i = 0; i < 52; i += 1) {
      const s = 0.25 + random() * 0.7, side = i % 2 ? 1 : -1
      const shrub = new THREE.Mesh(shrubGeometry, shrubMaterial)
      shrub.scale.set(0.5 + random() * 0.7, 0.38 + random() * 0.25, 0.55 + random() * 0.5)
      place(shrub, s, side * (widthAt(s) / 2 + 0.5 + random() * 5), 0.4)
      if (i % 3 === 0) {
        const fern = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.25), fernMaterial)
        place(fern, s, side * (widthAt(s) / 2 + 0.35 + random() * 1.7), 0.55, random() * Math.PI)
      }
    }
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 3.25, 8), woodMaterial)
    log.rotation.z = Math.PI / 2; log.castShadow = true; place(log, 0.74, 0, 0.3)

    const creekGeometry = new THREE.PlaneGeometry(76, 5.2, 32, 4).rotateX(-Math.PI / 2)
    const creek = new THREE.Mesh(creekGeometry, waterMaterial)
    creek.position.set(0, height(0, -138) + 0.08, -138); scene.add(creek)
    const bridge = new THREE.Group()
    for (let i = 0; i < 8; i += 1) { const plank = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.13, 0.62), woodMaterial); plank.position.z = (i - 3.5) * 0.62; plank.castShadow = true; bridge.add(plank) }
    place(bridge, 0.985, 0, 0.34)
    for (const [s, offset, scale] of [[0.91, -3, 0.9], [0.93, 3.2, 0.72], [0.97, -2.7, 0.65], [0.99, 3.4, 0.78]]) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial); rock.scale.set(scale, scale * 0.62, scale * 0.85); place(rock, s, offset, scale * 0.35)
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.68, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mossMaterial); moss.scale.set(scale, 0.18 * scale, 0.75 * scale); moss.position.copy(rock.position).add(new THREE.Vector3(0, scale * 0.42, 0)); scene.add(moss)
    }

    // Stage 2 remains part of this scene. The bridge above is the single shared
    // boundary chunk; all following placement uses route-v2 world progress.
    for (let i = 0; i < 164; i += 1) {
      const s = 1.015 + random() * .92, side = i % 2 ? 1 : -1
      const thinning = THREE.MathUtils.smoothstep(s, 1.55, 1.94)
      const scale = .5 + random() * (.65 - thinning * .18)
      const offset = side * (widthAt(Math.min(1, s - 1)) / 2 + .8 + random() * (5.5 + thinning * 5))
      place(tree(scale, i % 5), s, offset, 0, (random() - .5) * .65)
    }
    for (let i = 0; i < 72; i += 1) {
      const s = 1.03 + random() * .9, side = i % 2 ? 1 : -1
      const shrub = new THREE.Mesh(shrubGeometry, shrubMaterial)
      shrub.scale.set(.45 + random() * .8, .3 + random() * .4, .5 + random() * .6)
      place(shrub, s, side * (1.2 + random() * 5), .35)
    }
    // Hollow tree: a dark, moss-rimmed natural landmark, not a symbolic sign.
    const hollowTree = tree(1.38, 1)
    place(hollowTree, 1.39, -2.35, 0, .15)
    const hollow = new THREE.Mesh(new THREE.SphereGeometry(.46, 12, 8), new THREE.MeshToonMaterial({ color: 0x302d22 }))
    place(hollow, 1.39, -1.82, 1.45)
    hollow.scale.set(.7, 1.35, .28)
    const stageTwoLog = new THREE.Mesh(new THREE.CylinderGeometry(.42, .52, 5.4, 9), woodMaterial)
    stageTwoLog.rotation.z = Math.PI / 2; stageTwoLog.castShadow = true; place(stageTwoLog, 1.61, -1.3, .46, .25)
    // Low stone stargazing gate. It frames the continuing Stage 3 proxy road.
    const gate = new THREE.Group()
    for (const x of [-1.65, 1.65]) { const post = new THREE.Mesh(new THREE.BoxGeometry(.7, 3.1, .8), rockMaterial); post.position.set(x, 1.55, 0); post.castShadow = true; gate.add(post) }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.2, .65, .9), rockMaterial); lintel.position.y = 3.08; lintel.castShadow = true; gate.add(lintel)
    place(gate, 1.96, 0, 0)

    const meadowFog = new THREE.Color(0xc4dcd2), forestFog = new THREE.Color(0x779485)
    let frame = 0, lastTime = performance.now(), walkPhase = 0
    const resize = () => {
      const width = host.clientWidth, heightValue = host.clientHeight
      if (!width || !heightValue) return
      renderer.setSize(width, heightValue, false)
      camera.aspect = width / heightValue
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host); resize()
    const render = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000); lastTime = now
      const input = liveRef.current, progress = clampWorldProgress(input.journeyProgress)
      const s = progress > 1.975 ? 1.94 : Math.min(progress, 1.975), p = point(s), r = rightAt(s), look = point(Math.min(2, s + 0.045))
      const motion = input.reducedMotion ? 0.18 : 1
      if (input.isTyping) walkPhase += delta * (4.4 + Math.min(2, Math.max(0.45, input.typingPace)) * 3.4)
      const foot = Math.sin(walkPhase), vertical = input.isTyping ? Math.abs(foot) * 0.052 * motion : 0, lateral = input.isTyping ? foot * 0.034 * motion : 0
      camera.position.set(p.x + r.x * lateral, height(p.x, p.z) + 1.52 + vertical, p.z + r.z * lateral)
      camera.lookAt(look.x, height(look.x, look.z) + (progress > 1.94 ? .7 : 1.25) + vertical * .35, look.z)
      const stageOneForest = THREE.MathUtils.smoothstep(progress, .22, .68) * (1 - .18 * THREE.MathUtils.smoothstep(progress, .88, 1))
      const mountainOpening = THREE.MathUtils.smoothstep(progress, 1.56, 1.94)
      const forestMix = stageOneForest * (1 - .55 * mountainOpening)
      scene.fog.color.copy(meadowFog).lerp(forestFog, forestMix)
      scene.fog.density = THREE.MathUtils.lerp(0.0085, 0.024, forestMix)
      hemi.intensity = THREE.MathUtils.lerp(2, 1.22, forestMix)
      sun.intensity = THREE.MathUtils.lerp(3.1, 1.85, forestMix)
      renderer.toneMappingExposure = THREE.MathUtils.lerp(1.04, 0.91, forestMix)
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(frame); observer.disconnect()
      scene.traverse((object: any) => { object.geometry?.dispose?.(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material: any) => { material?.map?.dispose?.(); material?.dispose?.() }) })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  return (
    <div ref={hostRef} className={`stage-one-scene${failed ? ' is-fallback' : ''}`} aria-label="花の草原から森と星見の山道へ連続する3Dシーン">
      <div className="stage-one-paper" aria-hidden="true" />
      <div className="stage-one-wash" aria-hidden="true" />
      {failed && <p className="stage-one-webgl-note">3D背景を表示できないため、軽量背景で冒険を続けます。</p>}
    </div>
  )
}

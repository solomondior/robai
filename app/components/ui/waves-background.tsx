import { useRef, useEffect } from "react"
import { cn } from "~/lib/utils"

interface WavesProps {
  /**
   * Color of the wave lines
   */
  lineColor?: string
  /**
   * Background color of the container
   */
  backgroundColor?: string
  waveSpeedX?: number
  waveSpeedY?: number
  waveAmpX?: number
  waveAmpY?: number
  xGap?: number
  yGap?: number
  friction?: number
  tension?: number
  maxCursorMove?: number
  className?: string
}

class Grad {
  x: number;
  y: number;
  z: number;
  
  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
  dot2(x: number, y: number) {
    return this.x * x + this.y * y
  }
}
class Noise {
  grad3: Grad[];
  p: number[];
  perm: number[];
  gradP: Grad[];
  
  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ]
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
      120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
      33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
      71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
      133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
      63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
      226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
      59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
      152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
      39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
      246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ]
    this.perm = new Array(512)
    this.gradP = new Array(512)
    this.seed(seed)
  }
  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536
    seed = Math.floor(seed)
    if (seed < 256) seed |= seed << 8
    for (let i = 0; i < 256; i++) {
      let v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255)
      this.perm[i] = this.perm[i + 256] = v
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12]
    }
  }
  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b
  }
  perlin2(x: number, y: number) {
    let X = Math.floor(x),
      Y = Math.floor(y)
    x -= X
    y -= Y
    X &= 255
    Y &= 255
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y)
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1)
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y)
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1)
    const u = this.fade(x)
    return this.lerp(
      this.lerp(n00, n10, u),
      this.lerp(n01, n11, u),
      this.fade(y),
    )
  }
}

export function Waves({
  lineColor = "rgba(255, 255, 255, 0.3)",
  backgroundColor = "transparent",
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
  waveAmpY = 16,
  xGap = 10,
  yGap = 32,
  friction = 0.925,
  tension = 0.005,
  maxCursorMove = 100,
  className,
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const boundingRef = useRef({ width: 0, height: 0, left: 0, top: 0 })
  const noiseRef = useRef(new Noise(Math.random()))
  const linesRef = useRef<any[]>([])
  const mouseRef = useRef({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
    isOverInteractive: false,
    interactiveProximity: 0, // Track proximity to interactive elements
  })
  const animationFrameRef = useRef<number | null>(null)
  const mouseMoveFrameRef = useRef<number | null>(null)
  const isActiveRef = useRef(true)
  const lastUpdateTimeRef = useRef(0)
  const interactiveElementsRef = useRef<HTMLElement[]>([])
  const lastCacheTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    ctxRef.current = canvas.getContext("2d", { alpha: true, desynchronized: true })

    function setSize() {
      if (!container || !canvas) return
      boundingRef.current = container.getBoundingClientRect()
      canvas.width = boundingRef.current.width
      canvas.height = boundingRef.current.height
    }

    function setLines() {
      const { width, height } = boundingRef.current
      linesRef.current = []
      const oWidth = width + 200,
        oHeight = height + 30
      const totalLines = Math.ceil(oWidth / xGap)
      const totalPoints = Math.ceil(oHeight / yGap)
      const xStart = (width - xGap * totalLines) / 2
      const yStart = (height - yGap * totalPoints) / 2
      for (let i = 0; i <= totalLines; i++) {
        const pts = []
        for (let j = 0; j <= totalPoints; j++) {
          pts.push({
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          })
        }
        linesRef.current.push(pts)
      }
    }

    // Find and cache all interactive elements
    function cacheInteractiveElements() {
      // Throttle caching to avoid excessive DOM queries
      const now = performance.now()
      if (now - lastCacheTimeRef.current < 500) return
      lastCacheTimeRef.current = now
      
      // Comprehensive selector for all interactive elements
      const selectors = [
        'button', 
        'a', 
        'input', 
        'textarea', 
        '[role="button"]', 
        '.chat-input',
        // Specific selectors for example prompts and other special buttons
        '#examples button',
        '.GlowingEffect',
        '[class*="glowing"]',
        '[class*="Glowing"]',
        // Specific component selectors
        '.IconButton',
        '.SendButton',
        '.ModelSelector',
        // Any element with cursor-pointer
        '.cursor-pointer'
      ]
      
      const elements = Array.from(document.querySelectorAll(selectors.join(',')))
      
      // Also include any element with a click handler or hover styles
      const allElements = document.querySelectorAll('*')
      const additionalElements = Array.from(allElements).filter(el => {
        const styles = window.getComputedStyle(el)
        return (
          styles.cursor === 'pointer' || 
          el.hasAttribute('onClick') || 
          el.hasAttribute('onclick') ||
          el.hasAttribute('onmouseenter') ||
          el.hasAttribute('onmouseover')
        )
      })
      
      // Combine and deduplicate
      const combinedElements = [...new Set([...elements, ...additionalElements])]
      interactiveElementsRef.current = combinedElements as HTMLElement[]
    }

    // Calculate distance to nearest interactive element
    function updateInteractiveProximity(mouseX: number, mouseY: number) {
      const elements = interactiveElementsRef.current
      if (elements.length === 0) return
      
      let minDistance = Infinity
      let isDirectlyOver = false
      
      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        
        // Skip elements with zero size (hidden elements)
        if (rect.width === 0 || rect.height === 0) continue
        
        // Check if mouse is directly over the element
        if (
          mouseX >= rect.left && 
          mouseX <= rect.right && 
          mouseY >= rect.top && 
          mouseY <= rect.bottom
        ) {
          isDirectlyOver = true;
          // Don't break immediately - continue to find the minimum distance
          // This prevents the animation from completely disappearing
          minDistance = Math.min(minDistance, 10); // Set a small non-zero distance
          continue;
        }
        
        // Calculate distance to element edges with a small buffer
        const buffer = 5 // 5px buffer around elements
        const distX = mouseX < rect.left - buffer ? rect.left - buffer - mouseX : 
                     mouseX > rect.right + buffer ? mouseX - rect.right - buffer : 0
        const distY = mouseY < rect.top - buffer ? rect.top - buffer - mouseY : 
                     mouseY > rect.bottom + buffer ? mouseY - rect.bottom - buffer : 0
        
        const distance = Math.sqrt(distX * distX + distY * distY)
        minDistance = Math.min(minDistance, distance)
      }
      
      // Update mouse ref with proximity info
      mouseRef.current.isOverInteractive = isDirectlyOver
      
      // Adjust proximity calculation to create a larger influence zone
      // This creates a smoother transition when approaching interactive elements
      const proximityRadius = 150 // Increased from 100 to 150px for smoother transition
      
      // Ensure the proximity never reaches 1 (which would make the animation disappear)
      // Cap at 0.85 to maintain some animation even when directly over elements
      mouseRef.current.interactiveProximity = Math.min(0.85, Math.max(0, 1 - minDistance / proximityRadius))
    }

    function movePoints(time: number) {
      const lines = linesRef.current
      const mouse = mouseRef.current
      const noise = noiseRef.current
      
      // Calculate cursor influence based on proximity to interactive elements
      // Adjusted values for better responsiveness
      const baseInfluence = 0.00065
      const minInfluence = 0.0002 // Ensure this is never zero to maintain some animation
      
      // Smoother transition curve using cubic easing
      const easeProximity = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const easedProximity = easeProximity(mouse.interactiveProximity)
      
      // Always maintain some cursor influence, even when over interactive elements
      const cursorInfluence = Math.max(
        minInfluence,
        baseInfluence - (easedProximity * (baseInfluence - minInfluence))
      )
      
      lines.forEach((pts) => {
        pts.forEach((p: any) => {
          const move =
            noise.perlin2(
              (p.x + time * waveSpeedX) * 0.002,
              (p.y + time * waveSpeedY) * 0.0015,
            ) * 12
          p.wave.x = Math.cos(move) * waveAmpX
          p.wave.y = Math.sin(move) * waveAmpY

          // Always apply cursor influence, but scale it based on proximity to interactive elements
          const dx = p.x - mouse.sx,
            dy = p.y - mouse.sy
          const dist = Math.hypot(dx, dy),
            l = Math.max(175, mouse.vs)
          if (dist < l) {
            const s = 1 - dist / l
            const f = Math.cos(dist * 0.001) * s
            p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * cursorInfluence
            p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * cursorInfluence
          }

          p.cursor.vx += (0 - p.cursor.x) * tension
          p.cursor.vy += (0 - p.cursor.y) * tension
          p.cursor.vx *= friction
          p.cursor.vy *= friction
          p.cursor.x += p.cursor.vx * 2
          p.cursor.y += p.cursor.vy * 2

          p.cursor.x = Math.min(
            maxCursorMove,
            Math.max(-maxCursorMove, p.cursor.x),
          )
          p.cursor.y = Math.min(
            maxCursorMove,
            Math.max(-maxCursorMove, p.cursor.y),
          )
        })
      })
    }

    function moved(point: any, withCursor = true) {
      const x = point.x + point.wave.x + (withCursor ? point.cursor.x : 0)
      const y = point.y + point.wave.y + (withCursor ? point.cursor.y : 0)
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
    }

    function drawLines() {
      const { width, height } = boundingRef.current
      const ctx = ctxRef.current
      if (!ctx) return
      
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      ctx.strokeStyle = lineColor
      linesRef.current.forEach((points) => {
        let p1 = moved(points[0], false)
        ctx.moveTo(p1.x, p1.y)
        points.forEach((p: any, idx: number) => {
          const isLast = idx === points.length - 1
          p1 = moved(p, !isLast)
          const p2 = moved(
            points[idx + 1] || points[points.length - 1],
            !isLast,
          )
          ctx.lineTo(p1.x, p1.y)
          if (isLast) ctx.moveTo(p2.x, p2.y)
        })
      })
      ctx.stroke()
    }

    function tick(t: number) {
      if (!isActiveRef.current) return
      
      // Throttle updates to improve performance
      const now = performance.now()
      const elapsed = now - lastUpdateTimeRef.current
      
      if (elapsed < 16) { // Cap at ~60fps
        animationFrameRef.current = requestAnimationFrame(tick)
        return
      }
      
      lastUpdateTimeRef.current = now
      
      const mouse = mouseRef.current

      // Smoother mouse tracking with reduced sensitivity
      mouse.sx += (mouse.x - mouse.sx) * 0.05
      mouse.sy += (mouse.y - mouse.sy) * 0.05

      const dx = mouse.x - mouse.lx,
        dy = mouse.y - mouse.ly
      const d = Math.hypot(dx, dy)
      mouse.v = d
      mouse.vs += (d - mouse.vs) * 0.05
      mouse.vs = Math.min(50, mouse.vs) // Reduced max speed
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      mouse.a = Math.atan2(dy, dx)

      movePoints(t)
      drawLines()
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    function onResize() {
      setSize()
      setLines()
      cacheInteractiveElements() // Recache elements on resize
    }
    
    function onMouseMove(e: MouseEvent) {
      // Cancel any pending frame to avoid multiple updates
      if (mouseMoveFrameRef.current) {
        cancelAnimationFrame(mouseMoveFrameRef.current)
      }
      
      mouseMoveFrameRef.current = requestAnimationFrame(() => {
        updateMouse(e.clientX, e.clientY)
        updateInteractiveProximity(e.clientX, e.clientY)
        mouseMoveFrameRef.current = null
      })
    }
    
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const touch = e.touches[0]
      
      // Cancel any pending frame to avoid multiple updates
      if (mouseMoveFrameRef.current) {
        cancelAnimationFrame(mouseMoveFrameRef.current)
      }
      
      mouseMoveFrameRef.current = requestAnimationFrame(() => {
        updateMouse(touch.clientX, touch.clientY)
        updateInteractiveProximity(touch.clientX, touch.clientY)
        mouseMoveFrameRef.current = null
      })
    }
    
    function updateMouse(x: number, y: number) {
      const mouse = mouseRef.current
      const b = boundingRef.current
      mouse.x = x - b.left
      mouse.y = y - b.top + window.scrollY
      if (!mouse.set) {
        mouse.sx = mouse.x
        mouse.sy = mouse.y
        mouse.lx = mouse.x
        mouse.ly = mouse.y
        mouse.set = true
      }
    }

    // Handle visibility changes to improve performance
    function handleVisibilityChange() {
      isActiveRef.current = document.visibilityState === 'visible'
      
      if (isActiveRef.current) {
        if (animationFrameRef.current === null) {
          lastUpdateTimeRef.current = performance.now()
          animationFrameRef.current = requestAnimationFrame(tick)
        }
      } else if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    // Handle focus/blur events to maintain animation during user interaction
    function handleFocus() {
      isActiveRef.current = true
      if (animationFrameRef.current === null) {
        lastUpdateTimeRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(tick)
      }
    }
    
    // Update interactive elements when DOM changes
    const mutationObserver = new MutationObserver(() => {
      // Only recache when elements are added or removed
      cacheInteractiveElements()
    })

    setSize()
    setLines()
    cacheInteractiveElements() // Initial cache of interactive elements
    lastUpdateTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(tick)
    
    // Observe DOM changes to update interactive elements cache
    mutationObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    })
    
    // Periodically refresh the cache to catch any dynamically added elements
    const cacheInterval = setInterval(cacheInteractiveElements, 2000)
    
    window.addEventListener("resize", onResize, { passive: true })
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleFocus) // Keep animation running even when window loses focus

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mouseMoveFrameRef.current !== null) {
        cancelAnimationFrame(mouseMoveFrameRef.current)
      }
      clearInterval(cacheInterval)
      mutationObserver.disconnect()
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleFocus)
    }
  }, [
    lineColor,
    backgroundColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    xGap,
    yGap,
  ])

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor,
        willChange: "contents",
      }}
      className={cn(
        "absolute top-0 left-0 w-full h-full overflow-hidden",
        className,
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
} 
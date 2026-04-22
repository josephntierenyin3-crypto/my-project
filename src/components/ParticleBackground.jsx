import { useEffect, useMemo, useRef } from 'react'

function rand(min, max) {
  return Math.random() * (max - min) + min
}

export default function ParticleBackground({
  density = 70,
  maxSpeed = 0.35,
  linkDistance = 120,
  opacity = 0.25,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  const settings = useMemo(
    () => ({ density, maxSpeed, linkDistance, opacity }),
    [density, maxSpeed, linkDistance, opacity]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let particles = []

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(18, Math.floor((w * h) / (1000 * 12)) + settings.density)
      particles = new Array(count).fill(0).map(() => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-settings.maxSpeed, settings.maxSpeed),
        vy: rand(-settings.maxSpeed, settings.maxSpeed),
        r: rand(1.2, 2.2),
      }))
    }

    function step() {
      ctx.clearRect(0, 0, w, h)

      // Background tint (subtle)
      ctx.fillStyle = 'rgba(0,0,0,0.02)'
      ctx.fillRect(0, 0, w, h)

      // Draw links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > settings.linkDistance) continue
          const alpha = (1 - dist / settings.linkDistance) * settings.opacity
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(step)
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas.parentElement)
    resize()
    rafRef.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [settings])

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden />
}


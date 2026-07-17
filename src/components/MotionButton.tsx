import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '@/lib/hooks'
import { audioManager } from '@/lib/audio'
import type { ReactNode, PointerEvent } from 'react'

interface MotionButtonProps {
  children: ReactNode
  as?: 'button' | 'a'
  href?: string
  onClick?: () => void
  onPointerMove?: (e: PointerEvent<HTMLElement>) => void
  onPointerLeave?: (e: PointerEvent<HTMLElement>) => void
  className?: string
  cursorLabel?: string
  external?: boolean
  type?: 'button' | 'submit' | 'reset'
}

/** Spring-powered button/link with reduced-motion fallback.
 *  Adds a subtle scale + lift on hover and a tactile press on tap. */
export default function MotionButton({
  children,
  as = 'button',
  href,
  onClick,
  onPointerMove,
  onPointerLeave,
  className = '',
  cursorLabel,
  external,
  type = 'button',
}: MotionButtonProps) {
  const reduced = useReducedMotion()
  const Tag = as === 'a' ? motion.a : motion.button

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 250, damping: 18, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 250, damping: 18, mass: 0.4 })

  const handleMove = (e: PointerEvent<HTMLElement>) => {
    if (!reduced) {
      const r = e.currentTarget.getBoundingClientRect()
      mx.set((e.clientX - (r.left + r.width / 2)) * 0.3)
      my.set((e.clientY - (r.top + r.height / 2)) * 0.3)
    }
    onPointerMove?.(e)
  }
  const handleLeave = (e: PointerEvent<HTMLElement>) => {
    if (!reduced) {
      mx.set(0)
      my.set(0)
    }
    onPointerLeave?.(e)
  }

  const externalAttrs = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Tag
      href={as === 'a' ? href : undefined}
      onClick={() => {
        audioManager.playBlip('click')
        onClick?.()
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      type={as === 'button' ? type : undefined}
      data-cursor-label={cursorLabel}
      className={className}
      style={reduced ? undefined : { x: sx, y: sy }}
      {...externalAttrs}
      whileHover={reduced ? undefined : { scale: 1.03 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </Tag>
  )
}

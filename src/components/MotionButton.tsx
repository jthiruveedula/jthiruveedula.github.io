import { motion } from 'motion/react'
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

  const externalAttrs = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Tag
      href={as === 'a' ? href : undefined}
      onClick={() => {
        audioManager.playBlip('click')
        onClick?.()
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      type={as === 'button' ? type : undefined}
      data-cursor-label={cursorLabel}
      className={className}
      {...externalAttrs}
      whileHover={reduced ? undefined : { scale: 1.03, y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </Tag>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { portfolio } from '@/data/portfolio'
import { SECTIONS } from '@/components/Rail'

/**
 * The palette's actual content — deliberately the lazy half of CommandPalette.
 * This is the piece that imports `portfolio`, and the dataset is ~35kB the entry
 * bundle has no business paying for on a component nobody has opened yet. See
 * Curtain.tsx for the identical split and the same reasoning.
 */

interface Command {
  id: string
  label: string
  hint: string
  keywords?: string
  run: () => void
}

function useCommands(goTo: (id: string) => void): Command[] {
  return useMemo(() => {
    const { profile, featuredProjects } = portfolio

    const sectionCommands: Command[] = SECTIONS.map((s) => ({
      id: `go-${s.id}`,
      label: `Go to ${s.label}`,
      hint: 'Section',
      run: () => goTo(s.id),
    }))

    const projectCommands: Command[] = featuredProjects.map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      hint: p.client ?? 'System',
      keywords: p.tagline,
      run: () => goTo(p.id),
    }))

    const contactCommands: Command[] = []
    if (profile.email) {
      contactCommands.push({
        id: 'email',
        label: `Email ${profile.email}`,
        hint: 'Contact',
        run: () => {
          window.location.href = `mailto:${profile.email}`
        },
      })
    }
    if (profile.linkedin) {
      contactCommands.push({
        id: 'linkedin',
        label: 'Open LinkedIn',
        hint: 'Contact',
        run: () => window.open(profile.linkedin, '_blank', 'noopener,noreferrer'),
      })
    }
    if (profile.github) {
      contactCommands.push({
        id: 'github',
        label: 'Open GitHub',
        hint: 'Contact',
        run: () => window.open(profile.github, '_blank', 'noopener,noreferrer'),
      })
    }
    contactCommands.push({
      id: 'resume',
      label: 'View résumé',
      hint: 'Contact',
      run: () => {
        window.location.href = '/resume.html'
      },
    })

    return [...sectionCommands, ...projectCommands, ...contactCommands]
  }, [goTo])
}

export default function CommandPaletteBody({
  onClose,
  goTo,
}: {
  onClose: () => void
  goTo: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useCommands(goTo)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.hint} ${c.keywords ?? ''}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Autofocus the instant this mounts — the shell only renders this component
  // once `open` is already true, so there is no separate "now show it" step.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const runActive = () => {
    const cmd = filtered[activeIndex]
    if (cmd) cmd.run()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runActive()
    }
  }

  return (
    <div className="cmdk-scrim" role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a section, a system, or a contact action"
        className="cmdk"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section, a system, or contact…"
          className="cmdk__input"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-activedescendant={filtered[activeIndex] ? `cmdk-opt-${filtered[activeIndex].id}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <ul id="cmdk-list" ref={listRef} role="listbox" className="cmdk__list">
          {filtered.length === 0 && <li className="cmdk__empty">No match.</li>}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`cmdk-opt-${cmd.id}`}
              data-index={i}
              role="option"
              aria-selected={i === activeIndex}
              className={`cmdk__item ${i === activeIndex ? 'cmdk__item--active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => cmd.run()}
            >
              <span>{cmd.label}</span>
              <span className="cmdk__hint">{cmd.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

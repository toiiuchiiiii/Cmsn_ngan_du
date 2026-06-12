import { useRef, useState, useEffect, useCallback } from 'react'

interface ScrollPickerProps {
  items: string[]
  value: string
  onChange: (value: string, index: number) => void
  itemHeight?: number
  visibleCount?: number
  label?: string
}

export function ScrollPicker({
  items,
  value,
  onChange,
  itemHeight = 36,
  visibleCount = 5,
  label,
}: ScrollPickerProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedIndex = items.indexOf(value)
  const centerOffset = (visibleCount * itemHeight) / 2 - itemHeight / 2

  // Scroll to selected item on mount
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollTop = selectedIndex * itemHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = useCallback(() => {
    setIsScrolling(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsScrolling(false)
      if (!listRef.current) return
      const index = Math.round(listRef.current.scrollTop / itemHeight)
      const clamped = Math.max(0, Math.min(index, items.length - 1))
      if (items[clamped] && items[clamped] !== value) {
        onChange(items[clamped], clamped)
      }
    }, 80)
  }, [items, itemHeight, onChange, value])

  if (items.length === 0) return null

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-xs text-fg-tertiary mb-1 font-medium">{label}</span>
      )}
      <div className="relative">
        {/* Highlight bar */}
        <div
          className="absolute left-0 right-0 bg-accent-sage/15 rounded-lg pointer-events-none z-10"
          style={{
            top: centerOffset - itemHeight / 2 + 8,
            height: itemHeight,
          }}
        />
        {/* Scroll container */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="overflow-y-auto scrollbar-hide snap-y snap-mandatory"
          style={{
            height: visibleCount * itemHeight,
            scrollBehavior: isScrolling ? 'auto' : 'smooth',
          }}
          tabIndex={0}
          role="listbox"
          aria-label={label || 'Scroll picker'}
        >
          {/* Top padding for centering */}
          <div style={{ height: centerOffset }} />
          {items.map((item, i) => {
            const isSelected = i === selectedIndex
            return (
              <button
                key={`${item}-${i}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (listRef.current) {
                    listRef.current.scrollTop = i * itemHeight
                  }
                  onChange(item, i)
                }}
                className={`block w-full text-center transition-all snap-center select-none cursor-pointer
                  ${isSelected
                    ? 'text-fg-primary font-semibold scale-105'
                    : 'text-fg-tertiary hover:text-fg-secondary'
                  }`}
                style={{
                  height: itemHeight,
                  lineHeight: `${itemHeight}px`,
                  fontSize: isSelected ? '15px' : '13px',
                }}
              >
                {item}
              </button>
            )
          })}
          {/* Bottom padding for centering */}
          <div style={{ height: centerOffset }} />
        </div>
      </div>
    </div>
  )
}

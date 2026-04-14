/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'

export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const target = elementRef.current
    if (!target) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal when entering the viewport OR when already scrolled past (fast scroll)
        if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -5% 0px',
      },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={elementRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-element ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  )
}

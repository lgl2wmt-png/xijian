import { useState } from 'react'

const SRCSET =
  '/hero/hero-640.webp 640w, /hero/hero-960.webp 960w, /hero/hero-1280.webp 1280w, /hero/hero-1920.webp 1920w'

/** Full-bleed hero with LQIP blur-up + responsive WebP srcset. */
export function HeroPicture({ alt }: { alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#2a3644]">
      {/* LQIP: tiny blurred stand-in until full image paints */}
      <img
        src="/hero/hero-lqip.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        decoding="async"
      />
      <picture>
        <source type="image/webp" srcSet={SRCSET} sizes="100vw" />
        <img
          src="/hero/hero-1280.webp"
          srcSet={SRCSET}
          sizes="100vw"
          alt={alt}
          width={1280}
          height={853}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  )
}

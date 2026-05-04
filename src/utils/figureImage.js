function buildPlaceholderSvg(figure) {
  const title = (figure.name || figure.id || 'Figure').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const code = figure.id || 'N/A'
  const year = figure.year ? String(figure.year) : 'X-Transbots'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 760">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1c1f28" />
          <stop offset="55%" stop-color="#0b0d12" />
          <stop offset="100%" stop-color="#32090c" />
        </linearGradient>
        <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff4b4b" />
          <stop offset="100%" stop-color="#8d0f17" />
        </linearGradient>
      </defs>
      <rect width="640" height="760" fill="url(#bg)" />
      <circle cx="530" cy="110" r="120" fill="#7a0f18" opacity="0.18" />
      <circle cx="130" cy="620" r="170" fill="#1b5d8f" opacity="0.14" />
      <rect x="34" y="34" width="572" height="692" rx="26" fill="none" stroke="#ff4b4b" stroke-width="5" opacity="0.75" />
      <rect x="68" y="78" width="212" height="48" rx="24" fill="url(#panel)" />
      <text x="174" y="109" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle">X-TRANSBOTS</text>
      <text x="320" y="300" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="100" font-weight="800" text-anchor="middle" opacity="0.92">${code}</text>
      <text x="320" y="380" fill="#ff8080" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" text-anchor="middle" opacity="0.9">${year}</text>
      <text x="320" y="500" fill="#f6f7fb" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" text-anchor="middle">${title}</text>
      <text x="320" y="682" fill="#8e96a8" font-family="Arial, Helvetica, sans-serif" font-size="22" text-anchor="middle">Image coming soon</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function getFigureImageSrc(figure) {
  return figure.img || buildPlaceholderSvg(figure)
}

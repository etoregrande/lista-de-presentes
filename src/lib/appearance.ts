export const palettes = [
  {
    value: 'cherry',
    label: 'Cereja + baunilha',
    colors: ['#a33d58', '#f7e2b1'],
  },
  {
    value: 'coral',
    label: 'Coral + azul petróleo',
    colors: ['#cc453d', '#17454a'],
  },
  { value: 'violet', label: 'Violeta + lima', colors: ['#6547cf', '#ddebab'] },
  {
    value: 'blue',
    label: 'Azul elétrico + pêssego',
    colors: ['#2458cf', '#ffe0d0'],
  },
  {
    value: 'terracotta',
    label: 'Terracota + oliva',
    colors: ['#a54e3b', '#dbe3c7'],
  },
  { value: 'sage', label: 'Sálvia + pêssego', colors: ['#3d7258', '#f9dcc9'] },
  { value: 'plum', label: 'Ameixa + dourado', colors: ['#79436d', '#f4dfaa'] },
] as const

export type PaletteName = (typeof palettes)[number]['value']
export const appearanceThemes = ['light', 'dark', 'system'] as const
export type AppearanceTheme = (typeof appearanceThemes)[number]

export function isPalette(value: string): value is PaletteName {
  return palettes.some((palette) => palette.value === value)
}

export function isAppearanceTheme(value: string): value is AppearanceTheme {
  return appearanceThemes.some((theme) => theme === value)
}

export function readPalette(): PaletteName {
  const selected = document.documentElement.dataset.palette
  return selected && isPalette(selected) ? selected : 'cherry'
}

export function setPalette(value: PaletteName) {
  document.documentElement.dataset.palette = value
  localStorage.setItem('presenteio-palette', value)
  window.dispatchEvent(new Event('presenteio-palette-change'))
}

export function subscribePalette(callback: () => void) {
  window.addEventListener('presenteio-palette-change', callback)
  return () => window.removeEventListener('presenteio-palette-change', callback)
}

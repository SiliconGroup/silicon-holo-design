export interface ThemeTokens {
  colors: {
    'holo-cyan': string
    'holo-cyan-dim': string
    'holo-cyan-dark': string
    'holo-blue': string
    'holo-green': string
    'holo-purple': string
    'scene-void': string
    'scene-deep': string
    'scene-surface': string
    'status-success': string
    'status-warning': string
    'status-error': string
    'text-primary': string
    'text-secondary': string
    'text-muted': string
    'border-glow': string
    'border-subtle': string
    'border-muted': string
  }
}

export interface SemanticThemeTokens {
  colors: {
    'surface-canvas': string
    'surface-base': string
    'surface-base-soft': string
    'surface-raised': string
    'surface-raised-soft': string
    'surface-overlay': string
    'surface-overlay-soft': string
    'surface-inset'?: string
    'surface-glass'?: string
    'surface-interactive': string
    'surface-interactive-hover': string
    'surface-selected': string
    'content-primary': string
    'content-secondary': string
    'content-tertiary': string
    'content-disabled': string
    'content-accent': string
    'content-on-accent'?: string
    'stroke-muted': string
    'stroke-subtle': string
    'stroke-default': string
    'stroke-strong': string
    'stroke-accent': string
    'stroke-accent-strong': string
    'stroke-success': string
    'stroke-warning': string
    'stroke-error': string
    'accent-primary': string
    'accent-primary-hover': string
    'accent-primary-active': string
    'accent-primary-soft': string
    'accent-primary-softer': string
    'accent-blue': string
    'accent-blue-soft': string
    'accent-purple': string
    'accent-purple-soft': string
    'spectral-film-cyan'?: string
    'spectral-film-purple'?: string
    'spectral-highlight'?: string
    'spectral-edge'?: string
    'focus-ring': string
    'focus-ring-offset': string
    'overlay-scrim': string
    'success-soft': string
    'warning-soft': string
    'error-soft': string
  }
}

export const defaultTokens: ThemeTokens = {
  colors: {
    'holo-cyan': '#00ffff',
    'holo-cyan-dim': '#00cccc',
    'holo-cyan-dark': '#001a1a',
    'holo-blue': '#0088ff',
    'holo-green': '#00ffaa',
    'holo-purple': '#aa88ff',
    'scene-void': '#000a0f',
    'scene-deep': '#001219',
    'scene-surface': '#00212b',
    'status-success': '#00ff88',
    'status-warning': '#ffaa00',
    'status-error': '#ff5566',
    'text-primary': 'rgba(255,255,255,0.95)',
    'text-secondary': 'rgba(255,255,255,0.7)',
    'text-muted': 'rgba(255,255,255,0.55)',
    'border-glow': 'rgba(0,255,255,0.4)',
    'border-subtle': 'rgba(0,255,255,0.15)',
    'border-muted': 'rgba(255,255,255,0.08)',
  },
}

export const defaultSemanticTokens: SemanticThemeTokens = {
  colors: {
    'surface-canvas': '#000a0f',
    'surface-base': '#001219',
    'surface-base-soft': 'rgba(0,18,25,0.66)',
    'surface-raised': '#031a24',
    'surface-raised-soft': 'rgba(3,26,36,0.76)',
    'surface-overlay': '#061f2b',
    'surface-overlay-soft': 'rgba(6,31,43,0.82)',
    'surface-inset': '#000d13',
    'surface-glass': 'rgba(4,27,36,0.74)',
    'surface-interactive': 'rgba(4,28,37,0.72)',
    'surface-interactive-hover': 'rgba(7,39,50,0.82)',
    'surface-selected': 'rgba(8,49,60,0.82)',
    'content-primary': 'rgba(255,255,255,0.95)',
    'content-secondary': 'rgba(255,255,255,0.70)',
    'content-tertiary': 'rgba(255,255,255,0.55)',
    'content-disabled': 'rgba(202,222,232,0.28)',
    'content-accent': '#79e7ee',
    'content-on-accent': '#000a0f',
    'stroke-muted': 'rgba(179,210,222,0.07)',
    'stroke-subtle': 'rgba(179,210,222,0.12)',
    'stroke-default': 'rgba(179,210,222,0.20)',
    'stroke-strong': 'rgba(199,232,241,0.32)',
    'stroke-accent': 'rgba(69,218,229,0.52)',
    'stroke-accent-strong': 'rgba(91,235,242,0.76)',
    'stroke-success': 'rgba(0,255,136,0.4)',
    'stroke-warning': 'rgba(255,170,0,0.5)',
    'stroke-error': 'rgba(255,85,102,0.65)',
    'accent-primary': '#38d7e7',
    'accent-primary-hover': '#65e2ee',
    'accent-primary-active': '#27bdcf',
    'accent-primary-soft': 'rgba(56,215,231,0.12)',
    'accent-primary-softer': 'rgba(56,215,231,0.07)',
    'accent-blue': '#4ea4f5',
    'accent-blue-soft': 'rgba(78,164,245,0.08)',
    'accent-purple': '#a999f5',
    'accent-purple-soft': 'rgba(169,153,245,0.08)',
    'spectral-film-cyan': 'rgba(0,255,255,0.045)',
    'spectral-film-purple': 'rgba(170,136,255,0.028)',
    'spectral-highlight': 'rgba(225,251,255,0.055)',
    'spectral-edge': 'rgba(80,224,232,0.24)',
    'focus-ring': 'rgba(151,235,241,0.78)',
    'focus-ring-offset': '#001219',
    'overlay-scrim': 'rgba(0,5,8,0.72)',
    'success-soft': 'rgba(0,255,136,0.10)',
    'warning-soft': 'rgba(255,170,0,0.10)',
    'error-soft': 'rgba(255,85,102,0.11)',
  },
}

export interface ThemeOverride {
  colors?: Partial<ThemeTokens['colors']>
  semanticColors?: Partial<SemanticThemeTokens['colors']>
}

export interface ResolvedThemeTokens extends ThemeTokens {
  semanticColors: SemanticThemeTokens['colors']
}

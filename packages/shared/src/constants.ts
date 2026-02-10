export const PROJECT_TYPES = [
  { value: 'blog', label: 'Blog' },
  { value: 'novel', label: 'Novel' },
  { value: 'essay', label: 'Essay' },
  { value: 'other', label: 'Other' },
] as const

export const SINGLE_DOCUMENT_TYPES = ['blog', 'essay'] as const

export const AUTO_SAVE_DELAY = 2000
export const INACTIVITY_TIMEOUT = 2 * 60 * 1000 // 2 minutes
export const SAVE_INTERVAL = 30 * 1000 // 30 seconds

export interface Card {
  id: number
  dinosaur: string
  isFlipped: boolean
  isMatched: boolean
}

export const DINOSAURS = ['T-Rex', 'Sauropod', 'Triceratops', 'Pterodactyl']

export const DINOSAUR_EMOJIS: Record<string, string> = {
  'T-Rex': '\u{1F996}',
  'Sauropod': '\u{1F995}',
  'Triceratops': '\u{1F98E}',
  'Pterodactyl': '\u{1F985}'
}

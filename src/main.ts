import { Game } from './game'

const game = new Game()

document.getElementById('game-board')!.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  const card = target.closest('.card') as HTMLElement | null
  if (card && card.dataset.id) {
    game.flipCard(parseInt(card.dataset.id, 10))
  }
})

document.getElementById('restart-btn')!.addEventListener('click', () => {
  game.reset()
})

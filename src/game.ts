import { Card, DINOSAURS, DINOSAUR_EMOJIS } from './card'

export class Game {
  private cards: Card[] = []
  private flippedCards: number[] = []
  private isLocked: boolean = false
  private matchedPairs: number = 0
  private gameBoard: HTMLElement
  private winMessage: HTMLElement

  constructor() {
    this.gameBoard = document.getElementById('game-board')!
    this.winMessage = document.getElementById('win-message')!
    this.createCards()
    this.render()
  }

  private createCards(): void {
    const cardPairs: Card[] = []
    let id = 0

    DINOSAURS.forEach(dinosaur => {
      for (let i = 0; i < 2; i++) {
        cardPairs.push({
          id: id++,
          dinosaur,
          isFlipped: false,
          isMatched: false
        })
      }
    })

    this.cards = this.shuffle(cardPairs)
  }

  private shuffle(array: Card[]): Card[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  flipCard(cardId: number): void {
    if (this.isLocked) return
    if (this.flippedCards.length >= 2) return

    const card = this.cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    card.isFlipped = true
    this.flippedCards.push(cardId)
    this.render()

    if (this.flippedCards.length === 2) {
      this.checkMatch()
    }
  }

  private checkMatch(): void {
    this.isLocked = true
    const [id1, id2] = this.flippedCards
    const card1 = this.cards.find(c => c.id === id1)!
    const card2 = this.cards.find(c => c.id === id2)!

    if (card1.dinosaur === card2.dinosaur) {
      card1.isMatched = true
      card2.isMatched = true
      this.matchedPairs++
      this.flippedCards = []
      this.isLocked = false
      this.render()

      if (this.matchedPairs === DINOSAURS.length) {
        this.showWin()
      }
    } else {
      setTimeout(() => {
        card1.isFlipped = false
        card2.isFlipped = false
        this.flippedCards = []
        this.isLocked = false
        this.render()
      }, 1000)
    }
  }

  private showWin(): void {
    this.winMessage.classList.remove('hidden')
  }

  reset(): void {
    this.flippedCards = []
    this.isLocked = false
    this.matchedPairs = 0
    this.winMessage.classList.add('hidden')
    this.createCards()
    this.render()
  }

  private render(): void {
    this.gameBoard.innerHTML = ''

    this.cards.forEach(card => {
      const cardElement = document.createElement('div')
      cardElement.className = 'card'
      cardElement.dataset.id = String(card.id)
      cardElement.dataset.dinosaur = card.dinosaur

      if (card.isFlipped || card.isMatched) {
        cardElement.classList.add('flipped')
      }
      if (card.isMatched) {
        cardElement.classList.add('matched')
      }

      const cardInner = document.createElement('div')
      cardInner.className = 'card-inner'

      const cardBack = document.createElement('div')
      cardBack.className = 'card-back'

      const cardFront = document.createElement('div')
      cardFront.className = 'card-front'
      cardFront.textContent = DINOSAUR_EMOJIS[card.dinosaur]

      cardInner.appendChild(cardBack)
      cardInner.appendChild(cardFront)
      cardElement.appendChild(cardInner)
      this.gameBoard.appendChild(cardElement)
    })
  }
}

import puppeteer, { Browser, Page } from 'puppeteer'

const BASE_URL = 'http://localhost:3000'

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testPageLoad(page: Page): Promise<boolean> {
  console.log('Testing page load...')

  const title = await page.title()
  if (!title.includes('Dino')) {
    console.error('Title should contain "Dino"')
    return false
  }

  const cards = await page.$$('.card')
  if (cards.length !== 4) {
    console.error(`Expected 4 cards, found ${cards.length}`)
    return false
  }

  const flippedCards = await page.$$('.card.flipped')
  if (flippedCards.length !== 0) {
    console.error('Cards should start face-down')
    return false
  }

  console.log('Page load test PASSED')
  return true
}

async function testCardFlip(page: Page): Promise<boolean> {
  console.log('Testing card flip...')

  await page.reload()
  await delay(500)

  const firstCard = await page.$('.card')
  await firstCard?.click()
  await delay(100)

  const flippedCards = await page.$$('.card.flipped')
  if (flippedCards.length !== 1) {
    console.error('Expected 1 flipped card after clicking')
    return false
  }

  console.log('Card flip test PASSED')
  return true
}

async function testNonMatch(page: Page): Promise<boolean> {
  console.log('Testing non-matching cards...')

  await page.reload()
  await delay(500)

  const cardData = await page.$$eval('.card', cards =>
    cards.map((c, i) => ({
      index: i,
      dino: (c as HTMLElement).dataset.dinosaur
    }))
  )

  let firstIndex = -1
  let secondIndex = -1
  for (let i = 0; i < cardData.length; i++) {
    for (let j = i + 1; j < cardData.length; j++) {
      if (cardData[i].dino !== cardData[j].dino) {
        firstIndex = i
        secondIndex = j
        break
      }
    }
    if (firstIndex !== -1) break
  }

  const cards = await page.$$('.card')
  await cards[firstIndex].click()
  await delay(100)
  await cards[secondIndex].click()
  await delay(100)

  let flippedCards = await page.$$('.card.flipped')
  if (flippedCards.length !== 2) {
    console.error('Expected 2 flipped cards')
    return false
  }

  await delay(1200)

  flippedCards = await page.$$('.card.flipped')
  if (flippedCards.length !== 0) {
    console.error('Cards should flip back after non-match')
    return false
  }

  console.log('Non-match test PASSED')
  return true
}

async function testMatch(page: Page): Promise<boolean> {
  console.log('Testing matching cards...')

  await page.reload()
  await delay(500)

  const cardData = await page.$$eval('.card', cards =>
    cards.map((c, i) => ({
      index: i,
      dino: (c as HTMLElement).dataset.dinosaur
    }))
  )

  const pairs: Record<string, number[]> = {}
  cardData.forEach(c => {
    if (!pairs[c.dino!]) pairs[c.dino!] = []
    pairs[c.dino!].push(c.index)
  })

  const firstPair = Object.values(pairs)[0]
  const cards = await page.$$('.card')

  await cards[firstPair[0]].click()
  await delay(100)
  await cards[firstPair[1]].click()
  await delay(300)

  const matchedCards = await page.$$('.card.matched')
  if (matchedCards.length !== 2) {
    console.error('Expected 2 matched cards')
    return false
  }

  console.log('Match test PASSED')
  return true
}

async function testWinCondition(page: Page): Promise<boolean> {
  console.log('Testing win condition...')

  await page.reload()
  await delay(500)

  const cardData = await page.$$eval('.card', cards =>
    cards.map((c, i) => ({
      index: i,
      dino: (c as HTMLElement).dataset.dinosaur
    }))
  )

  const pairs: Record<string, number[]> = {}
  cardData.forEach(c => {
    if (!pairs[c.dino!]) pairs[c.dino!] = []
    pairs[c.dino!].push(c.index)
  })

  const cards = await page.$$('.card')

  for (const dino of Object.keys(pairs)) {
    const [i1, i2] = pairs[dino]
    await cards[i1].click()
    await delay(100)
    await cards[i2].click()
    await delay(300)
  }

  const winMessage = await page.$('#win-message:not(.hidden)')
  if (!winMessage) {
    console.error('Win message should be visible')
    return false
  }

  console.log('Win condition test PASSED')
  return true
}

async function testRestart(page: Page): Promise<boolean> {
  console.log('Testing restart...')

  const restartBtn = await page.$('#restart-btn')
  await restartBtn?.click()
  await delay(300)

  const flippedCards = await page.$$('.card.flipped')
  if (flippedCards.length !== 0) {
    console.error('Cards should be face-down after restart')
    return false
  }

  const matchedCards = await page.$$('.card.matched')
  if (matchedCards.length !== 0) {
    console.error('No cards should be matched after restart')
    return false
  }

  const winMessage = await page.$('#win-message.hidden')
  if (!winMessage) {
    console.error('Win message should be hidden after restart')
    return false
  }

  console.log('Restart test PASSED')
  return true
}

async function runTests(): Promise<void> {
  console.log('Starting Puppeteer tests...\n')

  const browser: Browser = await puppeteer.launch({ headless: 'new' })
  const page: Page = await browser.newPage()
  await page.setViewport({ width: 375, height: 667 })

  await page.goto(BASE_URL)
  await delay(500)

  const tests = [
    testPageLoad,
    testCardFlip,
    testNonMatch,
    testMatch,
    testWinCondition,
    testRestart
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      const result = await test(page)
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`Test failed with error: ${error}`)
      failed++
    }
    console.log('')
  }

  await browser.close()

  console.log('='.repeat(40))
  console.log(`Results: ${passed} passed, ${failed} failed`)
  console.log('='.repeat(40))

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err)
  process.exit(1)
})

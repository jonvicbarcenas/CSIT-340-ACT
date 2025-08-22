export const maxHealth = 100
export const maxLives = 3

export let currentHealth = maxHealth
export let currentLives = maxLives
export let score = 0
export let isInvulnerable = false

export function setScore(val) {
  score = val
  updateUI()
}

export function addScore(delta) {
  score += delta
  updateUI()
}

export function getScore() {
  return score
}

export function getHealth() {
  return currentHealth
}

export function setHealth(val) {
  currentHealth = Math.max(0, Math.min(maxHealth, val))
  updateHealthBar()
}

export function addHealth(delta) {
  setHealth(currentHealth + delta)
}

export function getLives() {
  return currentLives
}

export function setLives(val) {
  currentLives = val
  updateUI()
}

export function decLives() {
  currentLives = Math.max(0, currentLives - 1)
  updateUI()
}

export function updateHealthBar() {
  const healthPercentage = (currentHealth / maxHealth) * 100
  const fill = document.getElementById("healthBarFill")
  if (!fill) return
  fill.style.width = healthPercentage + "%"
  const text = document.getElementById("healthText")
  if (text) text.textContent = Math.max(0, currentHealth)

  if (healthPercentage > 60) {
    fill.style.background = "linear-gradient(90deg, #44ff44, #66ff66)"
  } else if (healthPercentage > 30) {
    fill.style.background = "linear-gradient(90deg, #ffff44, #ffff66)"
  } else {
    fill.style.background = "linear-gradient(90deg, #ff4444, #ff6666)"
  }
}

export function updateUI() {
  const scoreEl = document.getElementById("score")
  if (scoreEl) scoreEl.textContent = score
  const livesEl = document.getElementById("lives")
  if (livesEl) livesEl.textContent = currentLives
  updateHealthBar()
}

export function showDamageEffect() {
  const character = document.getElementById("myElement")
  if (!character) return
  character.classList.add("damage-effect")
  setTimeout(() => character.classList.remove("damage-effect"), 500)
}

export function makeInvulnerable(duration) {
  if (isInvulnerable) return
  isInvulnerable = true
  const character = document.getElementById("myElement")
  character?.classList.add("invulnerable")
  setTimeout(() => {
    isInvulnerable = false
    character?.classList.remove("invulnerable")
  }, duration)
}

export function showGameOver(finalScore) {
  const final = document.getElementById("finalScore")
  if (final) final.textContent = finalScore
  document.getElementById("gameOverScreen")?.classList.remove("hidden")
}

export function hideGameOver() {
  document.getElementById("gameOverScreen")?.classList.add("hidden")
}

import { addScore, getHealth, maxHealth, setHealth, makeInvulnerable } from "./ui.js"

export let powerUps = []
let powerUpSpawnTimer = 0
const powerUpSpawnDelay = 15000

export function createPowerUp() {
  const powerUp = document.createElement("div")
  const types = ["health", "shield"]
  const type = types[Math.random() < 0.7 ? 0 : 1]

  powerUp.className = `powerup ${type}`
  powerUp.style.left = Math.random() * (window.innerWidth - 100) + 50 + "px"
  powerUp.style.top = Math.random() * (window.innerHeight - 300) + 150 + "px"
  powerUp.dataset.type = type

  document.getElementById("powerUps")?.appendChild(powerUp)
  powerUps.push(powerUp)

  setTimeout(() => {
    const idx = powerUps.indexOf(powerUp)
    if (idx >= 0) {
      powerUp.remove()
      powerUps.splice(idx, 1)
    }
  }, 10000)
}

export function updatePowerUps() {
  const character = document.getElementById("myElement")
  if (!character) return
  const rect = character.getBoundingClientRect()
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i]
    if (checkRectCollision(rect, p.getBoundingClientRect())) {
      collectPowerUp(p.dataset.type)
      p.remove()
      powerUps.splice(i, 1)
    }
  }
}

export function spawnPowerUpsLoop(isDeadRef) {
  powerUpSpawnTimer += 16
  if (powerUpSpawnTimer >= powerUpSpawnDelay && !isDeadRef()) {
    powerUpSpawnTimer = 0
    createPowerUp()
  }
}

function collectPowerUp(type) {
  addScore(50)
  if (type === "health") {
    const newHealth = Math.min(maxHealth, getHealth() + 30)
    setHealth(newHealth)
  } else if (type === "shield") {
    makeInvulnerable(5000)
  }
}

export function clearAllPowerUps() {
  powerUps.forEach((p) => p.remove())
  powerUps = []
  powerUpSpawnTimer = 0
}

function checkRectCollision(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  )
}

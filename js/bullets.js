import { addScore, isInvulnerable } from "./ui.js"
import { takeDamage } from "./game.js"

export let bullets = []
let bulletSpawnTimer = 0
export let bulletSpawnDelay = 3000
const minBulletSpawnDelay = 800
const bulletSpeed = 3

export function createBullet(type) {
  const bullet = document.createElement("img")
  bullet.className = "bullet"

  if (type === "horizontal") {
    bullet.src = "../moves/moves/bullet_h.png"
    bullet.style.position = "absolute"
    bullet.style.left = window.innerWidth + "px"
    bullet.style.top = Math.random() * (window.innerHeight - 200) + 100 + "px"
    bullet.style.zIndex = "2"
    bullet.dataset.type = "horizontal"
    bullet.dataset.velocityX = -bulletSpeed
    bullet.dataset.velocityY = 0
  } else {
    bullet.src = "moves/moves/bullet_v.png"
    bullet.style.position = "absolute"
    bullet.style.left = Math.random() * (window.innerWidth - 100) + 50 + "px"
    bullet.style.top = "-50px"
    bullet.style.zIndex = "2"
    bullet.dataset.type = "vertical"
    bullet.dataset.velocityX = 0
    bullet.dataset.velocityY = bulletSpeed
  }

  document.body.appendChild(bullet)
  bullets.push(bullet)
}

export function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    const currentLeft = Number.parseFloat(bullet.style.left) || 0
    const currentTop = Number.parseFloat(bullet.style.top) || 0
    const velocityX = Number.parseFloat(bullet.dataset.velocityX) || 0
    const velocityY = Number.parseFloat(bullet.dataset.velocityY) || 0

    const newLeft = currentLeft + velocityX
    const newTop = currentTop + velocityY

    bullet.style.left = newLeft + "px"
    bullet.style.top = newTop + "px"

    const character = document.getElementById("myElement")
    if (character && checkRectCollision(character.getBoundingClientRect(), bullet.getBoundingClientRect()) && !isInvulnerable) {
      takeDamage(20)
      bullet.remove()
      bullets.splice(i, 1)
      continue
    }

    if (newLeft < -100 || newLeft > window.innerWidth + 100 || newTop < -100 || newTop > window.innerHeight + 100) {
      bullet.remove()
      bullets.splice(i, 1)
    }
  }
}

export function spawnBulletsLoop(isDeadRef) {
  bulletSpawnTimer += 16
  if (bulletSpawnTimer >= bulletSpawnDelay && !isDeadRef()) {
    bulletSpawnTimer = 0
    const bulletType = Math.random() < 0.5 ? "horizontal" : "vertical"
    createBullet(bulletType)
    addScore(10)
    return true
  }
  return false
}

export function increaseDifficulty() {
  if (bulletSpawnDelay > minBulletSpawnDelay) {
    bulletSpawnDelay = Math.max(minBulletSpawnDelay, bulletSpawnDelay - 50)
  }
}

export function clearAllBullets() {
  bullets.forEach((b) => b.remove())
  bullets = []
  bulletSpawnTimer = 0
}

function checkRectCollision(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  )
}

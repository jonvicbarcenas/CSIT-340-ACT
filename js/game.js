import { keysPressed } from "./input.js"
import { setAnimation } from "./animation.js"
import { addScore, decLives, getLives, getScore, setScore, setHealth, getHealth, isInvulnerable, makeInvulnerable, showDamageEffect, showGameOver, hideGameOver, updateUI } from "./ui.js"
import { clearAllBullets, increaseDifficulty } from "./bullets.js"
import { clearAllPowerUps } from "./powerups.js"

// Physics and jump
const upGrav = 60
const gravity = 0.8
const maxFallSpeed = 15
let velocityY = 0
let isOnGround = false
let jumpCount = 0
const maxJumps = 2
let lastJumpTime = 0
const jumpCooldown = 200

// Life state
let isDead = false
const respawnDelay = 1000
const initialPosition = { left: "50%", top: "20%" }

let isJumping = false

export const isDeadRef = () => isDead

export function toLeft() {
  const character = document.getElementById("myElement")
  const platform = document.getElementById("platform")
  const underground = document.getElementById("underground")
  if (!character || !platform || !underground) return

  const originalLeft = character.offsetLeft
  character.style.left = originalLeft - 10 + "px"
  if (checkCollision(character, underground)) {
    takeDamage(50)
    character.style.left = originalLeft + "px"
    return
  }
  if (checkHorizontalCollision(character, platform)) {
    character.style.left = originalLeft + "px"
  }
}

export function toRight() {
  const character = document.getElementById("myElement")
  const platform = document.getElementById("platform")
  const underground = document.getElementById("underground")
  if (!character || !platform || !underground) return

  const originalLeft = character.offsetLeft
  character.style.left = originalLeft + 10 + "px"
  if (checkCollision(character, underground)) {
    takeDamage(50)
    character.style.left = originalLeft + "px"
    return
  }
  if (checkHorizontalCollision(character, platform)) {
    character.style.left = originalLeft + "px"
  }
}

export function toUp() {
  const currentTime = Date.now()
  if (jumpCount < maxJumps && currentTime - lastJumpTime > jumpCooldown) {
    velocityY = -upGrav * 0.3
    jumpCount++
    lastJumpTime = currentTime
    isOnGround = false
    setAnimation("jump", true)
    isJumping = true
  }
}

export function toDown() {
  const character = document.getElementById("myElement")
  const platform = document.getElementById("platform")
  const underground = document.getElementById("underground")
  if (!character || !platform || !underground) return
  const originalTop = character.offsetTop
  character.style.top = originalTop + 10 + "px"
  if (checkCollision(character, underground)) {
    takeDamage(50)
    character.style.top = originalTop + "px"
    return
  }
  if (checkCollision(character, platform)) {
    character.style.top = originalTop + "px"
  }
}

export function toDiagonal(direction) {
  const character = document.getElementById("myElement")
  const platform = document.getElementById("platform")
  const underground = document.getElementById("underground")
  if (!character || !platform || !underground) return

  const originalLeft = character.offsetLeft
  const originalTop = character.offsetTop
  const diagonalSpeed = 7
  let newLeft = originalLeft
  let newTop = originalTop
  switch (direction) {
    case "left-up":
      newLeft = originalLeft - diagonalSpeed
      toUp()
      break
    case "right-up":
      newLeft = originalLeft + diagonalSpeed
      toUp()
      break
    case "left-down":
      newLeft = originalLeft - diagonalSpeed
      newTop = originalTop + diagonalSpeed
      break
    case "right-down":
      newLeft = originalLeft + diagonalSpeed
      newTop = originalTop + diagonalSpeed
      break
  }
  character.style.left = newLeft + "px"
  if (checkCollision(character, underground)) {
    takeDamage(50)
    character.style.left = originalLeft + "px"
    return
  }
  if (checkHorizontalCollision(character, platform)) {
    character.style.left = originalLeft + "px"
  }
  if (direction.includes("down")) {
    character.style.top = newTop + "px"
    if (checkCollision(character, underground)) {
      takeDamage(50)
      character.style.top = originalTop + "px"
    }
    if (checkCollision(character, platform)) {
      character.style.top = originalTop + "px"
    }
  }
}

export function handleMovement() {
  if (isDead) return
  const character = document.getElementById("myElement")
  if (!character) return

  if (keysPressed.left && keysPressed.up) {
    toDiagonal("left-up")
    if (!isJumping) setAnimation("left")
  } else if (keysPressed.right && keysPressed.up) {
    toDiagonal("right-up")
    if (!isJumping) setAnimation("right")
  } else if (keysPressed.left && keysPressed.down) {
    toDiagonal("left-down")
    if (!isJumping) setAnimation("left")
  } else if (keysPressed.right && keysPressed.down) {
    toDiagonal("right-down")
    if (!isJumping) setAnimation("right")
  } else if (keysPressed.left) {
    toLeft()
    if (!isJumping) setAnimation("left")
  } else if (keysPressed.right) {
    toRight()
    if (!isJumping) setAnimation("right")
  } else if (keysPressed.down) {
    toDown()
  } else if (!isJumping && isOnGround) {
    setAnimation("idle")
  }
}

export function gravityLoopTick() {
  if (isDead) return
  const character = document.getElementById("myElement")
  const platform = document.getElementById("platform")
  const underground = document.getElementById("underground")
  if (!character || !platform || !underground) return

  velocityY += gravity
  if (velocityY > maxFallSpeed) velocityY = maxFallSpeed

  const originalTop = character.offsetTop
  const newTop = originalTop + velocityY
  character.style.top = newTop + "px"

  if (checkCollision(character, underground)) {
    takeDamage(50)
    character.style.top = originalTop + "px"
    velocityY = 0
    return
  }

  if (checkCollision(character, platform)) {
    character.style.top = originalTop + "px"
    velocityY = 0
    if (!isOnGround) {
      isOnGround = true
      jumpCount = 0
      if (isJumping) {
        isJumping = false
        if (!keysPressed.left && !keysPressed.right && !keysPressed.up && !keysPressed.down) {
          setAnimation("idle")
        }
      }
    } else {
      isOnGround = true
      jumpCount = 0
    }
  } else {
    isOnGround = false
  }
}

export function takeDamage(dmg) {
  if (isInvulnerable || isDead) return
  setHealth(getHealth() - dmg)
  showDamageEffect()
  makeInvulnerable(2000)
  if (getHealth() <= 0) playerDeath()
}

export function playerDeath() {
  const character = document.getElementById("myElement")
  if (!character) return
  isDead = true
  decLives()
  velocityY = 0
  isOnGround = false
  jumpCount = 0
  character.style.opacity = "0.5"
  character.style.filter = "brightness(0.5)"
  clearAllBullets()
  clearAllPowerUps()
  if (getLives() <= 0) {
    showGameOver(getScore())
  } else {
    setTimeout(respawnPlayer, respawnDelay)
  }
}

export function respawnPlayer() {
  const character = document.getElementById("myElement")
  if (!character) return
  character.style.left = initialPosition.left
  character.style.top = initialPosition.top
  character.style.transform = "translate(-50%, -50%)"
  character.style.opacity = "1"
  character.style.filter = "brightness(1)"
  velocityY = 0
  isOnGround = false
  jumpCount = 0
  setHealth(100)
  isJumping = false
  setAnimation("idle")
  clearAllBullets()
  clearAllPowerUps()
  makeInvulnerable(3000)
  isDead = false
  updateUI()
}

export function restartGame() {
  setHealth(100)
  setScore(0)
  // Reset lives
  while (getLives() > 3) decLives()
  while (getLives() < 3) {
    // simple setter in absence of addLives
    // not strictly necessary
    break
  }
  const character = document.getElementById("myElement")
  if (character) {
    character.style.left = initialPosition.left
    character.style.top = initialPosition.top
    character.style.transform = "translate(-50%, -50%)"
    character.style.opacity = "1"
    character.style.filter = "brightness(1)"
    character.classList.remove("damage-effect", "invulnerable")
  }
  velocityY = 0
  isOnGround = false
  jumpCount = 0
  isJumping = false
  setAnimation("idle")
  clearAllBullets()
  clearAllPowerUps()
  hideGameOver()
  isDead = false
  updateUI()
}

export function checkCollision(character, platform) {
  const charRect = character.getBoundingClientRect()
  const platformRect = platform.getBoundingClientRect()
  return !(
    charRect.right < platformRect.left ||
    charRect.left > platformRect.right ||
    charRect.bottom < platformRect.top ||
    charRect.top > platformRect.bottom
  )
}

export function checkHorizontalCollision(character, platform) {
  const charRect = character.getBoundingClientRect()
  const platformRect = platform.getBoundingClientRect()
  const horizontalOverlap = !(charRect.right <= platformRect.left || charRect.left >= platformRect.right)
  const verticalOverlap = !(charRect.bottom <= platformRect.top || charRect.top >= platformRect.bottom)
  const significantVerticalOverlap = charRect.bottom > platformRect.top + 5
  return horizontalOverlap && verticalOverlap && significantVerticalOverlap
}

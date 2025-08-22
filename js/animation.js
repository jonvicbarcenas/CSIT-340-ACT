// Sprite animation system
export const animations = {
  idle: ["idle-1.png", "idle-2.png"],
  jump: ["jump-1.png", "jump-2.png", "jump-3.png", "jump-4.png", "jump-5.png", "jump-6.png", "jump-7.png"],
  left: ["left-1.png", "left-2.png", "left-3.png", "left-4.png"],
  right: ["right-1.png", "right-2.png", "right-3.png", "right-4.png", "right-5.png"],
}

export const spriteBasePath = "moves/moves/"

let currentAnimation = "idle"
let animationFrame = 1
let animationTimer = 0
const animationSpeed = 80

export function setAnimation(animation, forceUpdate = false) {
  if (currentAnimation === animation && !forceUpdate) return

  currentAnimation = animation
  animationFrame = 1
  animationTimer = 0

  const character = document.getElementById("myElement")
  const animationImages = animations[currentAnimation]
  if (character && animationImages && animationImages.length > 0) {
    character.src = `${spriteBasePath}${animationImages[0]}`
  }
}

export function updateAnimation() {
  const character = document.getElementById("myElement")
  if (!character) return
  const animationImages = animations[currentAnimation]
  if (!animationImages) return

  animationTimer += 16
  if (animationTimer >= animationSpeed) {
    animationTimer = 0
    animationFrame = (animationFrame % animationImages.length) + 1
    character.src = `${spriteBasePath}${animationImages[animationFrame - 1]}`
  }
}

export function isAnimationJumping() {
  return currentAnimation === "jump"
}

export const keysPressed = {
  left: false,
  right: false,
  up: false,
  down: false,
}

export function setupInput(onJump) {
  document.addEventListener("keydown", (e) => {
    const key = e.key
    switch (key) {
      case "ArrowLeft":
      case "a":
      case "A":
        keysPressed.left = true
        e.preventDefault()
        break
      case "ArrowRight":
      case "d":
      case "D":
        keysPressed.right = true
        e.preventDefault()
        break
      case "ArrowDown":
      case "s":
      case "S":
        keysPressed.down = true
        e.preventDefault()
        break
      case "ArrowUp":
      case "w":
      case "W":
      case " ":
        keysPressed.up = true
        if (onJump) onJump()
        e.preventDefault()
        break
      default:
        break
    }
  })

  document.addEventListener("keyup", (e) => {
    const key = e.key
    switch (key) {
      case "ArrowLeft":
      case "a":
      case "A":
        keysPressed.left = false
        break
      case "ArrowRight":
      case "d":
      case "D":
        keysPressed.right = false
        break
      case "ArrowDown":
      case "s":
      case "S":
        keysPressed.down = false
        break
      case "ArrowUp":
      case "w":
      case "W":
      case " ":
        keysPressed.up = false
        break
      default:
        break
    }
  })
}

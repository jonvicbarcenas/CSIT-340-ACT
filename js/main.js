import { setupInput } from "./input.js"
import { setAnimation, updateAnimation } from "./animation.js"
import { updateUI } from "./ui.js"
import { handleMovement, gravityLoopTick, restartGame, toUp, isDeadRef } from "./game.js"
import { spawnBulletsLoop, updateBullets, increaseDifficulty } from "./bullets.js"
import { spawnPowerUpsLoop, updatePowerUps } from "./powerups.js"

document.addEventListener("DOMContentLoaded", () => {
  setAnimation("idle")
  updateUI()
  const restartBtn = document.getElementById("restartButton")
  restartBtn?.addEventListener("click", restartGame)
  setupInput(() => toUp())

  // Physics loop
  setInterval(() => {
    gravityLoopTick()
  }, 16)

  // Game loop
  setInterval(() => {
    handleMovement()
    updateAnimation()
    if (spawnBulletsLoop(isDeadRef)) {
      if (/* every 100 score increaseDifficulty handled externally, keep separate if needed */ false) {
        increaseDifficulty()
      }
    }
    updateBullets()
    spawnPowerUpsLoop(isDeadRef)
    updatePowerUps()
  }, 16)
})

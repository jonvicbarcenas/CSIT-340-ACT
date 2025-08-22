// movement my bro
//key listener

const upGrav = 60;
const gravity = 0.8; // gravity acceleration
const maxFallSpeed = 15; // terminal velocity
let velocityY = 0; // current vertical velocity
let isOnGround = false;
let jumpCount = 0; // Track number of jumps
const maxJumps = 2; // Allow double jump (1 ground jump + 1 air jump)

// Death and reset system
let isDead = false;
const respawnDelay = 1000; // 1 second delay before respawn
const initialPosition = { left: '50%', top: '20%' }; // Starting position

const keysPressed = {
    left: false,
    right: false,
    up: false,
    down: false
};

let lastJumpTime = 0; // Prevent jump spam
const jumpCooldown = 200; // Milliseconds between jumps

// Animation system
let currentAnimation = 'idle'; // Current animation state: 'idle', 'jump', 'left', 'right'
let animationFrame = 1; // Current frame of animation
let animationTimer = 0; // Timer for animation frames
const animationSpeed = 80; // Milliseconds between animation frames (reduced for faster animation)
let isJumping = false; // Track if currently in jump animation

// Animation frames for each state
const animations = {
    idle: ['idle-1.png', 'idle-2.png'],
    jump: ['jump-1.png', 'jump-2.png', 'jump-3.png', 'jump-4.png', 'jump-5.png', 'jump-6.png', 'jump-7.png'],
    left: ['left-1.png', 'left-2.png', 'left-3.png', 'left-4.png'],
    right: ['right-1.png', 'right-2.png', 'right-3.png', 'right-4.png', 'right-5.png']
};

// Bullet system
let bullets = [];
let bulletSpawnTimer = 0;
const bulletSpawnDelay = 2000; // Spawn bullet every 2 seconds
const bulletSpeed = 3; // Bullet movement speed

function createBullet(type) {
    const bullet = document.createElement('img');
    bullet.className = 'bullet';
    
    if (type === 'horizontal') {
        bullet.src = 'moves/moves/bullet_h.png';
        bullet.style.position = 'absolute';
        bullet.style.left = window.innerWidth + 'px'; // Start from right edge of screen
        bullet.style.top = Math.random() * (window.innerHeight - 200) + 100 + 'px'; // Random height, avoiding edges
        bullet.style.zIndex = '2';
        bullet.dataset.type = 'horizontal';
        bullet.dataset.velocityX = -bulletSpeed;
        bullet.dataset.velocityY = 0;
    } else if (type === 'vertical') {
        bullet.src = 'moves/moves/bullet_v.png';
        bullet.style.position = 'absolute';
        bullet.style.left = Math.random() * (window.innerWidth - 100) + 50 + 'px'; // Random horizontal position
        bullet.style.top = '-50px'; // Start from above the screen
        bullet.style.zIndex = '2';
        bullet.dataset.type = 'vertical';
        bullet.dataset.velocityX = 0;
        bullet.dataset.velocityY = bulletSpeed;
    }
    
    document.body.appendChild(bullet);
    bullets.push(bullet);
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        const currentLeft = parseFloat(bullet.style.left) || 0;
        const currentTop = parseFloat(bullet.style.top) || 0;
        const velocityX = parseFloat(bullet.dataset.velocityX) || 0;
        const velocityY = parseFloat(bullet.dataset.velocityY) || 0;
        
        // Update bullet position
        const newLeft = currentLeft + velocityX;
        const newTop = currentTop + velocityY;
        
        bullet.style.left = newLeft + 'px';
        bullet.style.top = newTop + 'px';
        
        // Check collision with player
        const character = document.getElementById("myElement");
        if (checkBulletCollision(character, bullet)) {
            playerDeath();
            return;
        }
        
        // Remove bullet if it's off screen
        if (newLeft < -100 || newLeft > window.innerWidth + 100 || 
            newTop < -100 || newTop > window.innerHeight + 100) {
            bullet.remove();
            bullets.splice(i, 1);
        }
    }
}

function checkBulletCollision(character, bullet) {
    const charRect = character.getBoundingClientRect();
    const bulletRect = bullet.getBoundingClientRect();
    
    return !(
        charRect.right < bulletRect.left || charRect.left > bulletRect.right ||
        charRect.bottom < bulletRect.top || charRect.top > bulletRect.bottom
    );
}

function spawnBullets() {
    bulletSpawnTimer += 16; // Add frame time
    
    if (bulletSpawnTimer >= bulletSpawnDelay && !isDead) {
        bulletSpawnTimer = 0;
        
        // Randomly choose bullet type
        const bulletType = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        createBullet(bulletType);
    }
}

function clearAllBullets() {
    bullets.forEach(bullet => bullet.remove());
    bullets = [];
    bulletSpawnTimer = 0;
}

document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case "ArrowLeft":
        case "A":
        case "a":
            keysPressed.left = true;
            break;
        case "ArrowRight":
        case "D":
        case "d":
            keysPressed.right = true;
            break;
        case "ArrowUp":
        case "W":
        case "w":
            keysPressed.up = true;
            break;
        case "ArrowDown":
        case "S":
        case "s":
            keysPressed.down = true;
            break;
    }
});

document.addEventListener("keyup", function(event) {
    switch(event.key) {
        case "ArrowLeft":
        case "A":
        case "a":
            keysPressed.left = false;
            break;
        case "ArrowRight":
        case "D":
        case "d":
            keysPressed.right = false;
            break;
        case "ArrowUp":
        case "W":
        case "w":
            keysPressed.up = false;
            break;
        case "ArrowDown":
        case "S":
        case "s":
            keysPressed.down = false;
            break;
    }
});

// Animation system functions
function updateCharacterSprite() {
    const character = document.getElementById("myElement");
    const currentFrames = animations[currentAnimation];
    
    if (currentFrames && currentFrames.length > 0) {
        const frameIndex = (animationFrame - 1) % currentFrames.length;
        character.src = `moves/moves/${currentFrames[frameIndex]}`;
    }
}

function setAnimation(newAnimation, immediate = false) {
    if (currentAnimation !== newAnimation || immediate) {
        currentAnimation = newAnimation;
        animationFrame = 1;
        animationTimer = 0;
        updateCharacterSprite();
    }
}

function updateAnimation() {
    animationTimer += 16; // Add frame time (16ms for 60fps)
    
    if (animationTimer >= animationSpeed) {
        animationTimer = 0;
        animationFrame++;
        
        // Handle jump animation completion
        if (currentAnimation === 'jump' && animationFrame > animations.jump.length) {
            if (isOnGround) {
                setAnimation('idle');
                isJumping = false;
            } else {
                // Loop jump animation while in air, but start from frame 3 to avoid restart delay
                animationFrame = 3;
            }
        } else if (currentAnimation !== 'jump') {
            // Loop other animations
            if (animationFrame > animations[currentAnimation].length) {
                animationFrame = 1;
            }
        }
        
        updateCharacterSprite();
    }
}

function handleMovement() {
    // Don't allow movement if dead
    if (isDead) return;
    
    // Handle diagonal and single direction movement
    if (keysPressed.left && keysPressed.up) {
        toDiagonal('left-up');
        if (!isJumping) setAnimation('left');
    } else if (keysPressed.right && keysPressed.up) {
        toDiagonal('right-up');
        if (!isJumping) setAnimation('right');
    } else if (keysPressed.left && keysPressed.down) {
        toDiagonal('left-down');
        if (!isJumping) setAnimation('left');
    } else if (keysPressed.right && keysPressed.down) {
        toDiagonal('right-down');
        if (!isJumping) setAnimation('right');
    } else if (keysPressed.left) {
        toLeft();
        if (!isJumping) setAnimation('left');
    } else if (keysPressed.right) {
        toRight();
        if (!isJumping) setAnimation('right');
    } else if (keysPressed.up) {
        toUp();
    } else if (keysPressed.down) {
        toDown();
    } else {
        // No movement keys pressed
        if (!isJumping && isOnGround) {
            setAnimation('idle');
        }
    }
}

function toLeft() {
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    const underground = document.getElementById("underground");
    
    const originalLeft = character.offsetLeft;
    
    character.style.left = (originalLeft - 10) + "px";
    
    // Check for underground collision (death trigger)
    if (checkCollision(character, underground)) {
        playerDeath();
        return;
    }
    
    // Check for horizontal collision with platform
    if (checkHorizontalCollision(character, platform)) {
        character.style.left = originalLeft + "px";
    }
}

function toRight() {
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    const underground = document.getElementById("underground");
    
    const originalLeft = character.offsetLeft;
    
    character.style.left = (originalLeft + 10) + "px";
    
    // Check for underground collision (death trigger)
    if (checkCollision(character, underground)) {
        playerDeath();
        return;
    }
    
    // Check for horizontal collision with platform
    if (checkHorizontalCollision(character, platform)) {
        character.style.left = originalLeft + "px";
    }
}

function toUp(){
    const character = document.getElementById("myElement");
    const currentTime = Date.now();
    
    // Allow jumping if haven't reached max jumps and cooldown has passed
    if (jumpCount < maxJumps && (currentTime - lastJumpTime > jumpCooldown)) {
        velocityY = -upGrav * 0.3; // Set upward velocity for jump
        jumpCount++; // Increment jump counter
        lastJumpTime = currentTime; // Update last jump time
        isOnGround = false;
        
        // Trigger jump animation immediately
        setAnimation('jump', true);
        isJumping = true;
    }
}

function toDown(){
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    const underground = document.getElementById("underground");
    
    const originalTop = character.offsetTop;
    
    character.style.top = (originalTop + 10) + "px";
    
    // Check for underground collision (death trigger)
    if (checkCollision(character, underground)) {
        playerDeath();
        return;
    }
    
    // Check for platform collision
    if (checkCollision(character, platform)) {
        character.style.top = originalTop + "px";
    }
}

function toDiagonal(direction) {
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    const underground = document.getElementById("underground");
    
    const originalLeft = character.offsetLeft;
    const originalTop = character.offsetTop;
    
    // Diagonal movement with reduced speed to maintain consistent movement speed
    const diagonalSpeed = 7; // Slightly less than 10 to compensate for diagonal distance
    
    let newLeft = originalLeft;
    let newTop = originalTop;
    
    switch(direction) {
        case 'left-up':
            newLeft = originalLeft - diagonalSpeed;
            // Allow jumping if haven't reached max jumps and cooldown has passed
            const currentTime1 = Date.now();
            if (jumpCount < maxJumps && (currentTime1 - lastJumpTime > jumpCooldown)) {
                velocityY = -upGrav * 0.3; // Jump
                jumpCount++; // Increment jump counter
                lastJumpTime = currentTime1; // Update last jump time
                isOnGround = false;
                
                // Trigger jump animation immediately
                setAnimation('jump', true);
                isJumping = true;
            }
            break;
        case 'right-up':
            newLeft = originalLeft + diagonalSpeed;
            // Allow jumping if haven't reached max jumps and cooldown has passed
            const currentTime2 = Date.now();
            if (jumpCount < maxJumps && (currentTime2 - lastJumpTime > jumpCooldown)) {
                velocityY = -upGrav * 0.3; // Jump
                jumpCount++; // Increment jump counter
                lastJumpTime = currentTime2; // Update last jump time
                isOnGround = false;
                
                // Trigger jump animation immediately
                setAnimation('jump', true);
                isJumping = true;
            }
            break;
        case 'left-down':
            newLeft = originalLeft - diagonalSpeed;
            newTop = originalTop + diagonalSpeed;
            break;
        case 'right-down':
            newLeft = originalLeft + diagonalSpeed;
            newTop = originalTop + diagonalSpeed;
            break;
    }
    
    // Apply horizontal movement
    character.style.left = newLeft + "px";
    
    // Check for underground collision (death trigger)
    if (checkCollision(character, underground)) {
        playerDeath();
        return;
    }
    
    // Check horizontal collision with platform and revert if needed
    if (checkHorizontalCollision(character, platform)) {
        character.style.left = originalLeft + "px";
    }
    
    // Apply vertical movement (only for down movements, up is handled by gravity system)
    if (direction.includes('down')) {
        character.style.top = newTop + "px";
        
        // Check for underground collision (death trigger)
        if (checkCollision(character, underground)) {
            playerDeath();
            return;
        }
        
        // Check for platform collision
        if (checkCollision(character, platform)) {
            character.style.top = originalTop + "px";
        }
    }
}

function playerDeath() {
    const character = document.getElementById("myElement");
    
    // Set death state
    isDead = true;
    
    // Stop all movement
    velocityY = 0;
    isOnGround = false;
    jumpCount = 0;
    
    // Clear all bullets
    clearAllBullets();
    
    // Visual feedback - make character semi-transparent
    character.style.opacity = '0.5';
    character.style.filter = 'brightness(0.5)';
    
    // Show death message (optional)
    console.log("Player died! Respawning in " + (respawnDelay / 1000) + " seconds...");
    
    // Reset after delay
    setTimeout(respawnPlayer, respawnDelay);
}

function respawnPlayer() {
    const character = document.getElementById("myElement");
    
    // Reset position to starting point
    character.style.left = initialPosition.left;
    character.style.top = initialPosition.top;
    character.style.transform = 'translate(-50%, -50%)';
    
    // Reset visual effects
    character.style.opacity = '1';
    character.style.filter = 'brightness(1)';
    
    // Reset physics
    velocityY = 0;
    isOnGround = false;
    jumpCount = 0;
    
    // Reset animation state
    isJumping = false;
    setAnimation('idle');
    
    // Clear bullets and reset bullet timer
    clearAllBullets();
    
    // Revive player
    isDead = false;
    
    console.log("Player respawned!");
}

function checkCollision(character, platform) {
    const charRect = character.getBoundingClientRect();
    const platformRect = platform.getBoundingClientRect();
    
    return !(
        charRect.right < platformRect.left || charRect.left > platformRect.right ||
        charRect.bottom < platformRect.top || charRect.top > platformRect.bottom
    );
}

function checkHorizontalCollision(character, platform) {
    const charRect = character.getBoundingClientRect();
    const platformRect = platform.getBoundingClientRect();
    
    // Check if there's horizontal overlap AND vertical overlap (but not just standing on top)
    const horizontalOverlap = !(charRect.right <= platformRect.left || charRect.left >= platformRect.right);
    const verticalOverlap = !(charRect.bottom <= platformRect.top || charRect.top >= platformRect.bottom);
    
    // Only block if there's significant vertical overlap (not just touching the top)
    const significantVerticalOverlap = (charRect.bottom > platformRect.top + 5);
    
    return horizontalOverlap && verticalOverlap && significantVerticalOverlap;
}

//gravity with collision detection and realistic physics
setInterval(function() {
    // Don't apply physics if dead
    if (isDead) return;
    
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    const underground = document.getElementById("underground");
    
    // Apply gravity to velocity
    velocityY += gravity;
    
    // Cap falling speed at terminal velocity
    if (velocityY > maxFallSpeed) {
        velocityY = maxFallSpeed;
    }
    
    // Calculate new position
    const originalTop = character.offsetTop;
    const newTop = originalTop + velocityY;
    
    // Temporarily move character to check collision
    character.style.top = newTop + "px";
    
    // Check if character hits underground (death trigger)
    if (checkCollision(character, underground)) {
        playerDeath();
        return;
    }
    
    // Check if character hits platform (normal collision)
    if (checkCollision(character, platform)) {
        // Reset to position just above platform
        character.style.top = originalTop + "px";
        velocityY = 0; // Stop falling
        
        // Handle landing
        if (!isOnGround) {
            // Just landed
            isOnGround = true;
            jumpCount = 0; // Reset jump counter when landing
            
            // Reset animation state if was jumping
            if (isJumping) {
                isJumping = false;
                // Set to idle if no movement keys are pressed
                if (!keysPressed.left && !keysPressed.right && !keysPressed.up && !keysPressed.down) {
                    setAnimation('idle');
                }
            }
        } else {
            isOnGround = true;
            jumpCount = 0; // Reset jump counter when landing
        }
    } else {
        isOnGround = false;
    }
}, 16); // ~60 FPS for smoother physics

// Continuous movement loop for smooth diagonal movement
setInterval(function() {
    handleMovement();
    updateAnimation(); // Update sprite animations
    spawnBullets(); // Handle bullet spawning
    updateBullets(); // Update bullet positions and collisions
}, 16); // ~60 FPS for smooth movement

// Initialize animation system when page loads
document.addEventListener('DOMContentLoaded', function() {
    setAnimation('idle');
});
// movement my bro
//key listener

const upGrav = 60;
const gravity = 0.8; // gravity acceleration
const maxFallSpeed = 15; // terminal velocity
let velocityY = 0; // current vertical velocity
let isOnGround = false;

const keysPressed = {
    left: false,
    right: false,
    up: false,
    down: false
};

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
    handleMovement();
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

function handleMovement() {
    // Handle diagonal and single direction movement
    if (keysPressed.left && keysPressed.up) {
        toDiagonal('left-up');
    } else if (keysPressed.right && keysPressed.up) {
        toDiagonal('right-up');
    } else if (keysPressed.left && keysPressed.down) {
        toDiagonal('left-down');
    } else if (keysPressed.right && keysPressed.down) {
        toDiagonal('right-down');
    } else if (keysPressed.left) {
        toLeft();
    } else if (keysPressed.right) {
        toRight();
    } else if (keysPressed.up) {
        toUp();
    } else if (keysPressed.down) {
        toDown();
    }
}

function toLeft() {
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    
    const originalLeft = character.offsetLeft;
    
    character.style.left = (originalLeft - 10) + "px";
    
    // Check for horizontal collision (only block if moving into platform horizontally)
    if (checkHorizontalCollision(character, platform)) {
        character.style.left = originalLeft + "px";
    }
}

function toRight() {
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    
    const originalLeft = character.offsetLeft;
    
    character.style.left = (originalLeft + 10) + "px";
    
    // Check for horizontal collision (only block if moving into platform horizontally)
    if (checkHorizontalCollision(character, platform)) {
        character.style.left = originalLeft + "px";
    }
}

function toUp(){
    const character = document.getElementById("myElement");
    
    // Only jump if on ground to prevent double jumping
    if (isOnGround) {
        velocityY = -upGrav * 0.3; // Set upward velocity for jump
        isOnGround = false;
    }
}

function toDown(){
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    
    const originalTop = character.offsetTop;
    
    character.style.top = (originalTop + 10) + "px";
    
    if (checkCollision(character, platform)) {
        character.style.top = originalTop + "px";
    }
}

function toDiagonal(direction) {
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    
    const originalLeft = character.offsetLeft;
    const originalTop = character.offsetTop;
    
    // Diagonal movement with reduced speed to maintain consistent movement speed
    const diagonalSpeed = 7; // Slightly less than 10 to compensate for diagonal distance
    
    let newLeft = originalLeft;
    let newTop = originalTop;
    
    switch(direction) {
        case 'left-up':
            newLeft = originalLeft - diagonalSpeed;
            if (isOnGround) {
                velocityY = -upGrav * 0.3; // Jump
                isOnGround = false;
            }
            break;
        case 'right-up':
            newLeft = originalLeft + diagonalSpeed;
            if (isOnGround) {
                velocityY = -upGrav * 0.3; // Jump
                isOnGround = false;
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
    
    // Check horizontal collision and revert if needed
    if (checkHorizontalCollision(character, platform)) {
        character.style.left = originalLeft + "px";
    }
    
    // Apply vertical movement (only for down movements, up is handled by gravity system)
    if (direction.includes('down')) {
        character.style.top = newTop + "px";
        
        if (checkCollision(character, platform)) {
            character.style.top = originalTop + "px";
        }
    }
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
    const character = document.getElementById("myElement");
    const platform = document.getElementById("platform");
    
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
    
    // Check if character hits platform
    if (checkCollision(character, platform)) {
        // Reset to position just above platform
        character.style.top = originalTop + "px";
        velocityY = 0; // Stop falling
        isOnGround = true;
    } else {
        isOnGround = false;
    }
}, 16); // ~60 FPS for smoother physics
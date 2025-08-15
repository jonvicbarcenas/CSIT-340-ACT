// movement my bro
//key listener

const upGrav = 60;
const gravity = 0.8; // gravity acceleration
const maxFallSpeed = 15; // terminal velocity
let velocityY = 0; // current vertical velocity
let isOnGround = false;

document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case "ArrowLeft":
        case "A":
        case "a":
            toLeft();
            break;
        case "ArrowRight":
        case "D":
        case "d":
            toRight();
            break;
        case "ArrowUp":
        case "W":
        case "w":
            toUp();
            break;
    }
});

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
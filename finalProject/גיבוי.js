document.addEventListener('DOMContentLoaded', () => {
  // 1) Canvas Setup
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 450;

  // 2) Ground & Physics Settings
  const groundLevel = canvas.height - 50; // y-coordinate for the ground
  const moveSpeed = 4;                    // speed toward the mouse-click target
  const gravity = 0.7;
  const jumpForce = -15;                  // initial upward velocity when jumping

  // 3) Platform & Abyss
  //   - Left platform: x=0 to x=400
  //   - Abyss gap: x=400 to x=500
  //   - Landing platform: x=500 to canvas.width
  const gapStart = 400;
  const landingPlatformStart = 500;
  const winX = canvas.width - 50; // reaching near the right edge means you win

  // 4) Character Object
  const character = {
    x: 50,
    y: groundLevel,
    width: 30,   // collision width
    height: 50,  // collision height
    vy: 0,
    onGround: true
  };

  // The character will move horizontally toward this target x-coordinate
  let targetX = character.x;

  // 5) Game State
  // "playing", "gameOver", or "win"
  let gameState = 'playing';
  let messageTimer = 0; // frames to display message before resetting

  // 6) Sprite Setup
  const sprite = new Image();
  sprite.src = 'sprites/character.png'; // adjust path if needed

  // Adjust these to match your sprite’s frame size & layout
  const FRAME_WIDTH = 50;      // width of each sprite frame
  const FRAME_HEIGHT = 48;     // height of each sprite frame
  const TOTAL_FRAMES = 4;      // total frames in one row
  const ANIMATION_SPEED = 8;   // bigger = slower animation

  let currentFrame = 0;        // which frame is displayed
  let frameCounter = 0;        // counts steps before advancing frame

  // 7) Reset the game to initial state
  function resetGame() {
    character.x = 50;
    character.y = groundLevel;
    character.vy = 0;
    character.onGround = true;
    targetX = character.x;
    gameState = 'playing';
    messageTimer = 0;

    // Reset animation
    currentFrame = 0;
    frameCounter = 0;
  }

  // 8) Single Click => set targetX for horizontal movement
  canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    targetX = e.clientX - rect.left;
  });

  // 9) Double Click => jump if on the ground
  canvas.addEventListener('dblclick', () => {
    if (gameState !== 'playing') return;
    if (character.onGround) {
      character.vy = jumpForce;
      character.onGround = false;
    }
  });

  // 10) Update Game Logic
  function update() {
    if (gameState === 'playing') {
      // Move horizontally toward targetX
      if (Math.abs(character.x - targetX) > moveSpeed) {
        character.x += (character.x < targetX) ? moveSpeed : -moveSpeed;
      }

      // If airborne, apply jump physics
      if (!character.onGround) {
        character.y += character.vy;
        character.vy += gravity;
      }

      // Check if character has landed on the ground
      if (character.y >= groundLevel) {
        character.y = groundLevel;
        character.vy = 0;
        character.onGround = true;
      }

      // If on the ground but over the abyss => game over
      if (character.onGround && character.x >= gapStart && character.x < landingPlatformStart) {
        gameState = 'gameOver';
        messageTimer = 120; // ~2 seconds at 60fps
      }

      // If reached near the right edge => you win
      if (character.onGround && character.x >= winX) {
        gameState = 'win';
        messageTimer = 120;
      }

      // Animate the sprite only when the character is moving
      if (Math.abs(character.x - targetX) > moveSpeed) {
        frameCounter++;
        if (frameCounter >= ANIMATION_SPEED) {
          currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
          frameCounter = 0;
        }
      } else {
        // When not moving, keep the sprite on its idle frame (e.g., frame 0)
        currentFrame = 0;
        frameCounter = 0;
      }
    } else {
      // "gameOver" or "win" => countdown before resetting
      messageTimer--;
      if (messageTimer <= 0) {
        resetGame();
      }
    }
  }

  // 11) Draw Everything
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Left platform
    ctx.fillStyle = '#735034';
    ctx.fillRect(0, groundLevel, gapStart, canvas.height - groundLevel);

    // Landing platform
    ctx.fillRect(landingPlatformStart, groundLevel, canvas.width - landingPlatformStart, canvas.height - groundLevel);

    // Abyss (gap)
    ctx.fillStyle = '#000000';
    ctx.fillRect(gapStart, groundLevel, landingPlatformStart - gapStart, canvas.height - groundLevel);

    // Draw the character using the sprite
    const spriteX = currentFrame * FRAME_WIDTH; // x offset on the sprite sheet
    const spriteY = 0;                          // assuming one row of frames
    const drawX = character.x - (FRAME_WIDTH / 2); // center the sprite horizontally
    const drawY = character.y - FRAME_HEIGHT;      // align sprite bottom to ground

    ctx.drawImage(
      sprite,
      spriteX, spriteY,             // source x, y
      FRAME_WIDTH, FRAME_HEIGHT,    // source width, height
      drawX, drawY,                 // destination x, y
      FRAME_WIDTH, FRAME_HEIGHT     // destination width, height
    );

    // Messages
    if (gameState === 'gameOver') {
      ctx.fillStyle = 'red';
      ctx.font = '30px Arial';
      ctx.fillText('game over!', canvas.width / 2 - 80, canvas.height / 2);
    } else if (gameState === 'win') {
      ctx.fillStyle = 'green';
      ctx.font = '30px Arial';
      ctx.fillText('you did it!', canvas.width / 2 - 70, canvas.height / 2);
    }
  }

  // 12) Main Game Loop
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});

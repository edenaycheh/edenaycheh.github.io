document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 450;

  const groundLevel = canvas.height - 50; 
  const moveSpeed = 4;                    
  const gravity = 0.7;
  const jumpForce = -15;                  

  
  const gapStart = 400;
  const landingPlatformStart = 500;
  const winX = canvas.width - 50; 

  
  const character = {
    x: 50,
    y: groundLevel,
    width: 30,   
    height: 50,  
    vy: 0,
    onGround: true
  };

  let targetX = character.x;
  let gameState = 'intro';
  let messageTimer = 0;
  let firstLoad = true;
  let winPopupShown = false;


  const sprite = new Image();
  sprite.src = 'sprites/character.png'; 

  
  const FRAME_WIDTH = 50;      
  const FRAME_HEIGHT = 48;    
  const TOTAL_FRAMES = 4;     
  const ANIMATION_SPEED = 8;   

  let currentFrame = 0;        
  let frameCounter = 0;       

  
  const shelves = [
    { x: 250, y: 320, width: 60, height: 10 },  
    { x: 320, y: 270, width: 60, height: 10 }   
  ];
  
  let currentShelf = null;
 
  let secondShelfTouched = false;


  const introPopup = document.getElementById('introPopup');
  const popupOkButton = document.getElementById('popupOkButton');
  const winPopup = document.getElementById('winPopup');
  const restartButton = document.getElementById('restartButton');
  const nextButton = document.getElementById('nextButton');


  popupOkButton.addEventListener('click', () => {
    introPopup.style.display = 'none';
    gameState = 'playing';
    firstLoad = false;
  });

  
  restartButton.addEventListener('click', () => {
    winPopup.style.display = 'none';
    winPopupShown = false;
    resetGame();
  });

  //Waiting for the link
  
  nextButton.addEventListener('click', () => {
    window.location.href = "next.html"; 
  });

  
  function resetGame() {
    character.x = 50;
    character.y = groundLevel;
    character.vy = 0;
    character.onGround = true;
    targetX = character.x;
    messageTimer = 0;
    currentFrame = 0;
    frameCounter = 0;
    currentShelf = null;
    secondShelfTouched = false;
    
   
    if (firstLoad) {
      gameState = 'intro';
      introPopup.style.display = 'flex';
    } else {
      gameState = 'playing';
    }
  }

  canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (currentShelf) {
      targetX = clickX;
      character.vy = jumpForce;
      character.onGround = false;
      currentShelf = null;
    } else {
      targetX = clickX;
    }
  });

  // Double Click: Jump if on the ground.
  canvas.addEventListener('dblclick', () => {
    if (gameState !== 'playing') return;
    if (character.onGround && !currentShelf) {
      character.vy = jumpForce;
      character.onGround = false;
    }
  });
  function update() {
    if (gameState === 'playing') {
      if (!currentShelf) {
        if (Math.abs(character.x - targetX) > moveSpeed) {
          character.x += (character.x < targetX) ? moveSpeed : -moveSpeed;
        } else {
          character.x = targetX;
        }
      } else { 
        character.x = currentShelf.x + currentShelf.width / 2;
      }

      // Vertical Movement:
      // Apply gravity if the character is not on the ground.
      if (!character.onGround) {
        character.y += character.vy;
        character.vy += gravity;
      }
      if (!currentShelf && !character.onGround) {
        for (let shelf of shelves) {
          if (
            character.x + character.width / 2 > shelf.x &&
            character.x - character.width / 2 < shelf.x + shelf.width
          ) {
            // If the character is falling onto a shelf
            if (character.y >= shelf.y && character.y - character.vy < shelf.y) {
              character.y = shelf.y;
              character.vy = 0;
              character.onGround = true;
              currentShelf = shelf;
              if (shelf === shelves[1]) {
                secondShelfTouched = true;
              }
              break;
            }
          }
        }
      }

      if (character.y >= groundLevel) {
        character.y = groundLevel;
        character.vy = 0;
        character.onGround = true;
        currentShelf = null;
      }
      if (
        character.onGround &&
        character.y === groundLevel &&
        character.x >= gapStart &&
        character.x < landingPlatformStart
      ) {
        gameState = 'gameOver';
        messageTimer = 120; // ~2 seconds 
      }
      if (character.onGround && character.x >= winX) {
        gameState = 'win';
        if (!winPopupShown) {
          winPopup.style.display = 'flex';
          winPopupShown = true;
        }
      }

      if (!currentShelf && Math.abs(character.x - targetX) > moveSpeed) {
        frameCounter++;
        if (frameCounter >= ANIMATION_SPEED) {
          currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
          frameCounter = 0;
        }
      } else {
        currentFrame = 0;
        frameCounter = 0;
      }
    } else if (gameState === 'gameOver') {
      messageTimer--;
      if (messageTimer <= 0) {
        resetGame();
      }
    }
   
  }

 
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Left Platform
    ctx.fillStyle = '#735034';
    ctx.fillRect(0, groundLevel, gapStart, canvas.height - groundLevel);
    ctx.fillRect(landingPlatformStart, groundLevel, canvas.width - landingPlatformStart, canvas.height - groundLevel);
    ctx.fillStyle = secondShelfTouched ? '#000000' : '#735034';
    ctx.fillRect(gapStart, groundLevel, landingPlatformStart - gapStart, canvas.height - groundLevel);

    ctx.fillStyle = '#282830';
    shelves.forEach(shelf => {
      ctx.fillRect(shelf.x, shelf.y, shelf.width, shelf.height);
    });

    const spriteX = currentFrame * FRAME_WIDTH;
    const spriteY = 0;
    const drawX = character.x - (FRAME_WIDTH / 2);
    const drawY = character.y - FRAME_HEIGHT;
    ctx.drawImage(
      sprite,
      spriteX, spriteY,
      FRAME_WIDTH, FRAME_HEIGHT,
      drawX, drawY,
      FRAME_WIDTH, FRAME_HEIGHT
    );

    // Draw Game Over or Win messages on the canvas if needed.
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

  // Main Game Loop
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
});

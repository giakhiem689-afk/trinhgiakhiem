// Game configuration and main engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let gameState = 'start_screen'; // start_screen, playing, paused, game_over, level_clear
let level = null;
let player = null;
let enemies = [];
let items = [];
let particles = [];
let bouncingBlocks = [];
let sasuke = null; // Sasuke character at the end

let cameraX = 0;
let levelTime = 300;
let timeTimer = 0;
let finalScoreCalculated = false;

// Controls configuration
const keys = {
    left: false,
    right: false,
    jump: false,
    down: false,
    shift: false,
    fire: false
};

// Procedural Konoha background objects (Parallax layers)
const bgClouds = [
    { x: 120, y: 60, w: 60, h: 25 },
    { x: 380, y: 40, w: 90, h: 30 },
    { x: 650, y: 70, w: 50, h: 20 },
    { x: 920, y: 50, w: 80, h: 30 },
    { x: 1200, y: 60, w: 60, h: 25 },
    { x: 1500, y: 40, w: 90, h: 30 },
    { x: 1800, y: 70, w: 50, h: 20 },
    { x: 2100, y: 50, w: 80, h: 30 },
    { x: 2400, y: 60, w: 60, h: 25 }
];

const bgHills = [
    { x: 50, w: 140, h: 65 },
    { x: 420, w: 200, h: 85 }, // Large hill where Hokage Faces are carved!
    { x: 800, w: 120, h: 55 },
    { x: 1150, w: 160, h: 75 },
    { x: 1500, w: 140, h: 65 },
    { x: 1880, w: 200, h: 85 },
    { x: 2250, w: 120, h: 55 },
    { x: 2600, w: 160, h: 75 }
];

// Konoha themed Torii Gates and Pine Trees
const bgToriiGates = [
    { x: 300, w: 40, h: 50 },
    { x: 950, w: 40, h: 50 },
    { x: 1600, w: 40, h: 50 },
    { x: 2200, w: 40, h: 50 },
    { x: 2800, w: 40, h: 50 },
    { x: 3400, w: 40, h: 50 },
    { x: 4000, w: 40, h: 50 }
];

const bgPineTrees = [
    { x: 150, h: 45 },
    { x: 580, h: 60 },
    { x: 740, h: 50 },
    { x: 1100, h: 55 },
    { x: 1350, h: 45 },
    { x: 1800, h: 60 },
    { x: 2050, h: 50 },
    { x: 2450, h: 55 },
    { x: 3100, h: 55 },
    { x: 3700, h: 60 }
];

// Helper to spawn brick particle debris
function spawnBrickDebris(x, y) {
    particles.push(new Particle(x - 5, y - 5, -80, -220, '#d97706', 0.6));
    particles.push(new Particle(x + 5, y - 5, 80, -220, '#d97706', 0.6));
    particles.push(new Particle(x - 5, y + 5, -60, -140, '#d97706', 0.6));
    particles.push(new Particle(x + 5, y + 5, 60, -140, '#d97706', 0.6));
}

// Initialise Game Map & Levels
function loadLevel(levelName) {
    const data = LEVEL_DATA[levelName];
    level = {
        width: data.width,
        height: data.height,
        map: [...data.map],
        flagX: data.flagX,
        castleX: data.castleX,
        flagY: 2 * 25,
        
        bounceBlock: function(row, col) {
            if (bouncingBlocks.some(b => b.row === row && b.col === col)) return;
            bouncingBlocks.push({
                row: row,
                col: col,
                offset: 0,
                vy: -180,
                gravity: 1200
            });
        },
        
        spawnDebris: function(x, y) {
            spawnBrickDebris(x, y);
            Sound.playSFX('stomp'); // break block sound
        },

        playBounceSound: function() {
            Sound.playSFX('fireball');
        },

        spawnCoinItem: function(blockX, blockY) {
            particles.push(new PopCoin(blockX, blockY - 20));
            Sound.playSFX('coin');
            spawnScoreText(blockX + 12, blockY - 20, "200");
        },

        spawnPowerup: function(blockX, blockY, type) {
            items.push(new Item(blockX + 2, blockY, type));
            Sound.playSFX('powerup');
        }
    };

    // Instantiate Naruto
    player = new Player(data.playerStart.x, data.playerStart.y);

    // Instantiate Sasuke at the castle gates
    sasuke = new Sasuke((level.castleX - 0.5) * 25, 14 * 25 - 42);

    // Spawn enemies (mapping Naruto edition classes)
    enemies = [];
    data.enemies.forEach(enemyDef => {
        if (enemyDef.type === 'sakura_chibi') {
            enemies.push(new SakuraChibi(enemyDef.x * 25, enemyDef.y * 25));
        } else if (enemyDef.type === 'sakura_kawari') {
            enemies.push(new SakuraKawari(enemyDef.x * 25, enemyDef.y * 25));
        }
    });

    items = [];
    particles = [];
    bouncingBlocks = [];
    cameraX = 0;
    levelTime = 300;
    timeTimer = 0;
    finalScoreCalculated = false;
    
    updateHUD();
}

function spawnScoreText(x, y, text) {
    particles.push(new ScoreText(x, y, text));
}

// Draw a single 25x25 tile procedurally
function drawTile(ctx, tile, tx, ty) {
    const x = tx * 25;
    const y = ty * 25;

    let offsetY = 0;
    const bouncing = bouncingBlocks.find(b => b.row === ty && b.col === tx);
    if (bouncing) {
        offsetY = Math.round(bouncing.offset);
    }

    ctx.save();
    ctx.translate(Math.round(x - cameraX), Math.round(y + offsetY));

    switch (tile) {
        case '#': // Konoha brick ground tile
            ctx.fillStyle = '#b45309'; // Reddish wood/brick tile
            ctx.fillRect(0, 0, 25, 25);
            ctx.fillStyle = '#10b981'; // green moss line
            ctx.fillRect(0, 0, 25, 3);
            
            // Stone markings
            ctx.fillStyle = '#78350f';
            ctx.fillRect(6, 12, 4, 4);
            ctx.fillRect(18, 8, 3, 3);
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, 0.5, 24, 24);
            break;

        case 'B': // Red brick block (breaking is allowed)
            ctx.fillStyle = '#d97706'; // Amber wood block
            ctx.fillRect(0, 0, 25, 25);
            
            ctx.fillStyle = '#451a03';
            ctx.fillRect(0, 7, 25, 2);
            ctx.fillRect(0, 16, 25, 2);
            ctx.fillRect(10, 0, 2, 8);
            ctx.fillRect(16, 8, 2, 8);
            ctx.fillRect(6, 17, 2, 8);
            
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(1, 1, 23, 1);
            ctx.strokeStyle = '#451a03';
            ctx.strokeRect(0.5, 0.5, 24, 24);
            break;

        case '?': // Active Scroll box (blinking)
        case 'M':
            const blink = Math.floor(Date.now() / 250) % 2 === 0;
            ctx.fillStyle = blink ? '#ff9900' : '#d46a00';
            ctx.fillRect(0, 0, 25, 25);
            
            // Draw Konoha Swirl symbol inside block
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Spiral draw
            ctx.arc(12.5, 12.5, 5, 0, Math.PI * 1.5, false);
            ctx.stroke();
            // Arrow/Point on swirl
            ctx.fillStyle = '#000000';
            ctx.fillRect(15, 6, 2, 2);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, 0.5, 24, 24);
            break;

        case 'S': // Solid block (inactive box)
            ctx.fillStyle = '#783c18';
            ctx.fillRect(0, 0, 25, 25);
            ctx.strokeStyle = '#451c03';
            ctx.strokeRect(0.5, 0.5, 24, 24);
            // Swirl indicator that it is empty
            ctx.fillStyle = '#451c03';
            ctx.beginPath();
            ctx.arc(12.5, 12.5, 3, 0, Math.PI*2);
            ctx.fill();
            break;

        case 't': // Ninja bamboo/pipe top left
            ctx.fillStyle = '#0f766e'; // Teal/Cyan bamboo green
            ctx.fillRect(0, 0, 25, 25);
            ctx.fillStyle = '#2dd4bf'; // highlight
            ctx.fillRect(6, 0, 4, 25);
            ctx.strokeStyle = '#042f2e';
            ctx.strokeRect(0.5, 0.5, 24.5, 24);
            break;

        case 'T': // Ninja bamboo top right
            ctx.fillStyle = '#0f766e';
            ctx.fillRect(0, 0, 25, 25);
            ctx.fillStyle = '#115e59'; // shadow
            ctx.fillRect(16, 0, 6, 25);
            ctx.strokeStyle = '#042f2e';
            ctx.strokeRect(-0.5, 0.5, 25, 24);
            break;

        case 'p': // Ninja bamboo body left
            ctx.fillStyle = '#0f766e';
            ctx.fillRect(2, 0, 23, 25);
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(8, 0, 3, 25);
            ctx.strokeStyle = '#042f2e';
            ctx.beginPath();
            ctx.moveTo(2.5, 0); ctx.lineTo(2.5, 25);
            ctx.stroke();
            break;

        case 'P': // Ninja bamboo body right
            ctx.fillStyle = '#0f766e';
            ctx.fillRect(0, 0, 23, 25);
            ctx.fillStyle = '#115e59';
            ctx.fillRect(15, 0, 5, 25);
            ctx.strokeStyle = '#042f2e';
            ctx.beginPath();
            ctx.moveTo(22.5, 0); ctx.lineTo(22.5, 25);
            ctx.stroke();
            break;

        case 'C': // Floating Narutomaki/Ramen 🍥
            const coinSpin = Math.abs(Math.sin(Date.now() / 150));
            ctx.translate(12.5, 12.5);
            ctx.scale(coinSpin, 1);
            
            // Draw Narutomaki fishcake (white circle with pink spiral)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI*2);
            ctx.fill();
            
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 1.5);
            ctx.stroke();
            break;

        case 'F': // Flagpole (Konoha banner pole)
            ctx.fillStyle = '#b45309'; // brown wooden pole
            ctx.fillRect(11, 0, 3, 25);
            ctx.strokeStyle = '#451a03';
            ctx.strokeRect(10.5, -0.5, 4, 26);

            // Draw a gold ball at the top of the flag
            if (ty === 2 || (level && level.map[ty-1] && level.map[ty-1][tx] !== 'F')) {
                ctx.fillStyle = '#f59e0b'; // Gold ball
                ctx.beginPath();
                ctx.arc(12.5, 2, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#b45309';
                ctx.stroke();
            }

            // Draw a slate stone base at the bottom of the flag
            if (ty === 13 || (level && level.map[ty+1] && level.map[ty+1][tx] !== 'F')) {
                ctx.fillStyle = '#64748b'; // Gray slate base
                ctx.fillRect(4, 18, 17, 7);
                ctx.strokeStyle = '#334155';
                ctx.strokeRect(3.5, 17.5, 18, 8);
            }
            break;

        case 'h': // Castle Wall Top (Japanese roof tiles)
            ctx.fillStyle = '#1e293b'; // Slate gray roof
            ctx.fillRect(0, 0, 25, 25);
            // Draw curved roof shape
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 25, 6);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(0.5, 0.5, 24, 24);
            break;

        case 'H': // Castle Wall (Red dojo walls)
            ctx.fillStyle = '#dc2626'; // Dojo red
            ctx.fillRect(0, 0, 25, 25);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(0.5, 0.5, 24, 24);
            // Column lines
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(11, 0, 3, 25);
            break;

        case 'd': // Castle Door
            ctx.fillStyle = '#1e1b4b'; // Deep dark gateway
            ctx.fillRect(0, 0, 25, 25);
            break;
    }

    ctx.restore();
}

// Parallax Background Rendering
function drawParallaxBackground(ctx) {
    // 1. Sky Gradient
    ctx.fillStyle = '#38bdf8'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Clouds Layer (Far parallax: x * 0.12)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    bgClouds.forEach(cloud => {
        const cx = Math.round(cloud.x - cameraX * 0.12);
        if (cx + cloud.w < 0 || cx > canvas.width) return;
        
        ctx.beginPath();
        ctx.arc(cx + 15, cloud.y, 15, 0, Math.PI * 2);
        ctx.arc(cx + 35, cloud.y - 10, 20, 0, Math.PI * 2);
        ctx.arc(cx + 60, cloud.y, 18, 0, Math.PI * 2);
        ctx.rect(cx + 10, cloud.y - 5, 50, 20);
        ctx.fill();
    });

    // 3. Hills Layer with carved Hokage monument! (Parallax: x * 0.3)
    bgHills.forEach((hill, idx) => {
        const hx = Math.round(hill.x - cameraX * 0.3);
        if (hx + hill.w < 0 || hx > canvas.width) return;

        // Rock/Hill color
        ctx.fillStyle = '#857d70'; // Rock gray/brown
        ctx.beginPath();
        ctx.moveTo(hx, 350);
        ctx.quadraticCurveTo(hx + hill.w / 2, 350 - hill.h * 1.8, hx + hill.w, 350);
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = '#696257';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx, 350);
        ctx.quadraticCurveTo(hx + hill.w / 2, 350 - hill.h * 1.8, hx + hill.w, 350);
        ctx.stroke();

        // EASTER EGG: Draw Hokage Monument carving outlines on the big 2nd hill
        if (idx === 1) {
            ctx.strokeStyle = 'rgba(28, 25, 23, 0.3)';
            ctx.lineWidth = 1.5;
            
            // Draw 4 faces outline simple vectors
            const startCarveX = hx + 50;
            const carveY = 350 - hill.h + 20;

            for (let f = 0; f < 4; f++) {
                const fx = startCarveX + f * 26;
                // Face oval
                ctx.beginPath();
                ctx.arc(fx, carveY, 9, 0, Math.PI*2);
                ctx.stroke();
                // Spiky hair lines on rock
                ctx.beginPath();
                ctx.moveTo(fx - 9, carveY - 4);
                ctx.lineTo(fx - 4, carveY - 14);
                ctx.lineTo(fx, carveY - 8);
                ctx.lineTo(fx + 4, carveY - 14);
                ctx.lineTo(fx + 9, carveY - 4);
                ctx.stroke();
                // Nose/Eyes lines
                ctx.beginPath();
                ctx.moveTo(fx, carveY - 4);
                ctx.lineTo(fx, carveY + 3); // nose
                ctx.moveTo(fx - 3, carveY + 6);
                ctx.lineTo(fx + 3, carveY + 6); // mouth
                ctx.stroke();
            }
        }
    });

    // 4. Japanese Red Torii Gates (Parallax: x * 0.45)
    bgToriiGates.forEach(gate => {
        const gx = Math.round(gate.x - cameraX * 0.45);
        if (gx + gate.w < 0 || gx > canvas.width) return;

        ctx.fillStyle = '#dc2626'; // Bright Torii Red
        // Two main pillars
        ctx.fillRect(gx + 4, 350 - gate.h, 6, gate.h);
        ctx.fillRect(gx + gate.w - 10, 350 - gate.h, 6, gate.h);
        
        // Bottom crossbar
        ctx.fillRect(gx + 2, 350 - gate.h * 0.75, gate.w - 4, 4);

        // Top main curved crossbar
        ctx.fillRect(gx - 4, 350 - gate.h, gate.w + 8, 6);
        ctx.fillStyle = '#1e293b'; // Black top roof segment
        ctx.fillRect(gx - 4, 350 - gate.h - 2, gate.w + 8, 2);

        // Center plaque
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gx + gate.w/2 - 4, 350 - gate.h, 8, 10);
    });

    // 5. Pine Trees Layer (Parallax: x * 0.6)
    bgPineTrees.forEach(tree => {
        const tx = Math.round(tree.x - cameraX * 0.6);
        if (tx + 30 < 0 || tx > canvas.width) return;

        // Trunk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(tx + 12, 350 - tree.h * 0.2, 6, tree.h * 0.2);

        // Pine branches (3 stacked green triangles)
        ctx.fillStyle = '#065f46'; // Dark pine green
        
        // Bottom triangle
        ctx.beginPath();
        ctx.moveTo(tx, 350 - tree.h * 0.2);
        ctx.lineTo(tx + 15, 350 - tree.h * 0.6);
        ctx.lineTo(tx + 30, 350 - tree.h * 0.2);
        ctx.closePath();
        ctx.fill();

        // Mid triangle
        ctx.beginPath();
        ctx.moveTo(tx + 3, 350 - tree.h * 0.5);
        ctx.lineTo(tx + 15, 350 - tree.h * 0.8);
        ctx.lineTo(tx + 27, 350 - tree.h * 0.5);
        ctx.closePath();
        ctx.fill();

        // Top triangle
        ctx.beginPath();
        ctx.moveTo(tx + 6, 350 - tree.h * 0.75);
        ctx.lineTo(tx + 15, 350 - tree.h);
        ctx.lineTo(tx + 24, 350 - tree.h * 0.75);
        ctx.closePath();
        ctx.fill();
    });
}

// Update game physics and logic
let lastTime = 0;
function gameUpdate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (dt > 0.1) dt = 0.1;

    if (gameState === 'playing' || gameState === 'hugging') {
        if (gameState === 'playing') {
            timeTimer += dt;
            if (timeTimer >= 1.0) {
                levelTime--;
                timeTimer = 0;
                if (levelTime <= 0) {
                    player.die(Sound);
                }
                updateHUD();
            }
        }

        const spawnParticle = p => particles.push(p);
        const spawnItem = i => items.push(i);

        if (gameState === 'playing') {
            player.update(dt, keys, level, Sound, spawnParticle, spawnItem);
        } else if (gameState === 'hugging') {
            // Cutscene mode: No input, Naruto and Sasuke stand next to each other
            player.update(dt, { left: false, right: false, jump: false, down: false, shift: false, fire: false }, level, Sound, spawnParticle, spawnItem);
            player.vx = 0;
            player.vy = 0;
            if (sasuke) {
                sasuke.vx = 0;
                sasuke.vy = 0;
            }

            // Spawn hearts (spawn faster for intense hugging!)
            if (typeof this.heartTimer === 'undefined') this.heartTimer = 0;
            this.heartTimer += dt;
            if (this.heartTimer > 0.08) {
                // Spawn heart between Naruto and Sasuke's heads
                const heartX = (player.x + (sasuke ? sasuke.x : player.x)) / 2 + 10 + (Math.random() - 0.5) * 12;
                const heartY = player.y - 10 + (Math.random() - 0.5) * 10;
                particles.push(new HeartParticle(heartX, heartY));
                this.heartTimer = 0;
            }

            if (typeof this.hugTimer === 'undefined') this.hugTimer = 0;
            this.hugTimer += dt;
            if (this.hugTimer >= 3.5) {
                this.hugTimer = undefined;
                this.heartTimer = undefined;
                setGameState('level_clear');
            }
        }

        if (sasuke) sasuke.update(dt, level);

        if (player.isDying && player.y > level.height * 25 + 100) {
            if (player.lives > 0) {
                loadLevel('world1_1');
                setGameState('playing');
            } else {
                setGameState('game_over');
            }
        }

        bouncingBlocks.forEach((block, idx) => {
            block.vy += block.gravity * dt;
            block.offset += block.vy * dt;
            if (block.offset >= 0) {
                block.offset = 0;
                bouncingBlocks.splice(idx, 1);
            }
        });

        enemies.forEach(enemy => enemy.update(dt, level, Sound));
        enemies = enemies.filter(enemy => !enemy.isDead);

        items.forEach(item => item.update(dt, level));
        items = items.filter(item => !item.isDead);

        particles.forEach(p => p.update(dt));
        particles = particles.filter(p => !p.isDead);

        const targetCamX = player.x - canvas.width / 2.5;
        if (targetCamX > cameraX) {
            cameraX = targetCamX;
        }
        const maxCamX = (level.width * 25) - canvas.width;
        if (cameraX > maxCamX) cameraX = maxCamX;
        if (cameraX < 0) cameraX = 0;

        if (gameState === 'playing') {
            handleCollisions();
        }
        
        const flagpoleX = level.flagX * 25;
        if (player.x >= flagpoleX - 5 && !player.isDying && !player.flagClimbing && gameState === 'playing' && !player.autoWalkRight) {
            triggerLevelClear();
        }
        
        if (player.flagClimbing) {
            if (level) {
                level.flagY = Math.min(13 * 25 - 20, Math.max(2 * 25, player.y));
            }
        }

        // Auto walk right to Sasuke check
        if (player.autoWalkRight && sasuke) {
            if (player.x >= sasuke.x - 6) { // stand closer for hugging!
                player.autoWalkRight = false;
                player.vx = 0;
                player.direction = 1;
                setGameState('hugging');
            }
        }

        updateHUD();
    } else if (gameState === 'level_clear') {
        if (!finalScoreCalculated) {
            calculateFinalScores();
        }
    }

    gameDraw();
    requestAnimationFrame(gameUpdate);
}

// Perform collision queries between entities
function handleCollisions() {
    if (player.isDying || player.flagClimbing || player.autoWalkRight) return;

    const playerRect = player.getRect();

    // Check collision with Sasuke -> WIN condition!
    if (sasuke && rectIntersect(playerRect, sasuke.getRect())) {
        triggerLevelClear();
        return;
    }

    items.forEach(item => {
        if (item.isPoppingUp) return;
        if (rectIntersect(playerRect, item.getRect())) {
            if (item.type === 'mushroom') {
                player.grow(Sound);
                player.score += 1000;
                spawnScoreText(item.x + 10, item.y, "1000");
                item.isDead = true;
            } else if (item.type === 'flower') {
                player.grow(Sound);
                player.score += 1000;
                spawnScoreText(item.x + 10, item.y, "1000");
                item.isDead = true;
            }
        }
    });

    enemies.forEach(enemy => {
        if (enemy.isSquished || enemy.isDead) return;

        if (rectIntersect(playerRect, enemy.getRect())) {
            const isStomp = player.vy > 0 && (player.y + player.height - player.vy * 0.05) <= enemy.y + 12;

            if (isStomp) {
                if (enemy.type === 'goomba') { // Sakura Chibi
                    enemy.squish(Sound);
                    player.vy = -260;
                    player.score += 100;
                    spawnScoreText(enemy.x + 10, enemy.y, "100");
                } else if (enemy.type === 'koopa') { // Sakura Kawari (Substitution log)
                    if (enemy.state === 'walking') {
                        enemy.squish(Sound);
                        player.vy = -260;
                        player.score += 100;
                        spawnScoreText(enemy.x + 10, enemy.y, "100");
                    } else if (enemy.state === 'shell') {
                        const dir = player.x + player.width/2 < enemy.x + enemy.width/2 ? 1 : -1;
                        enemy.kick(dir, Sound);
                        player.vy = -180;
                    } else if (enemy.state === 'movingShell') {
                        enemy.state = 'shell';
                        enemy.vx = 0;
                        enemy.speed = 0;
                        player.vy = -180;
                        Sound.playSFX('stomp');
                    }
                }
            } else {
                if (enemy.type === 'koopa' && enemy.state === 'shell') {
                    const dir = player.x + player.width/2 < enemy.x + enemy.width/2 ? 1 : -1;
                    enemy.kick(dir, Sound);
                } else {
                    if (!player.isInvincible) {
                        player.shrink(Sound);
                    }
                }
            }
        }

        if (enemy.type === 'koopa' && enemy.state === 'movingShell') {
            enemies.forEach(other => {
                if (other === enemy || other.isSquished || other.isDead) return;
                if (rectIntersect(enemy.getRect(), other.getRect())) {
                    other.isDead = true;
                    other.vy = -200;
                    other.vx = enemy.vx * 0.3;
                    other.gravity = 1000;
                    other.isDead = false;
                    other.isSquished = true;
                    other.squishTimer = -5;
                    player.score += 200;
                    spawnScoreText(other.x + 10, other.y, "200");
                    Sound.playSFX('stomp');
                }
            });
        }
    });

    items.forEach(item => {
        if (item.type === 'fireball') {
            enemies.forEach(enemy => {
                if (enemy.isSquished || enemy.isDead) return;
                if (rectIntersect(item.getRect(), enemy.getRect())) {
                    enemy.isDead = true;
                    item.isDead = true;
                    player.score += 200;
                    spawnScoreText(enemy.x + 10, enemy.y, "200");
                    Sound.playSFX('stomp');
                }
            });
        }
    });
}

function triggerLevelClear() {
    player.flagClimbing = true;
    player.x = level.flagX * 25 + 3;
    player.vx = 0;
    Sound.playSFX('stage_clear');
}

function calculateFinalScores() {
    finalScoreCalculated = true;
    const timeBonus = levelTime * 10;
    player.score += timeBonus;
    
    const savedHighScore = localStorage.getItem('marioHighScore') || 0;
    if (player.score > savedHighScore) {
        localStorage.setItem('marioHighScore', player.score);
    }

    document.getElementById('finalScore').innerText = String(player.score).padStart(6, '0');
    document.getElementById('finalTime').innerText = String(levelTime).padStart(3, '0');
    document.getElementById('timeBonus').innerText = String(timeBonus).padStart(4, '0');
    
    setTimeout(() => {
        document.getElementById('gameWinScreen').classList.remove('hidden');
    }, 1500);
}

// Render entire level and entities
function gameDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (level === null) return;

    drawParallaxBackground(ctx);

    const startCol = Math.floor(cameraX / 25);
    const endCol = Math.floor((cameraX + canvas.width) / 25) + 1;
    
    for (let row = 0; row < level.height; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (col >= level.width) continue;
            const tile = level.map[row][col];
            if (tile && tile !== '.') {
                drawTile(ctx, tile, col, row);
            }
        }
    }

    // Draw White Konoha Swirl Banner Flag on flagpole
    const poleX = level.flagX * 25 + 12.5;
    let flagY = level.flagY;
    
    ctx.save();
    ctx.translate(Math.round(poleX - cameraX - 18), Math.round(flagY));
    // Banner white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 18, 14);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(0, 0, 18, 14);
    // Red Konoha swirl emblem
    ctx.strokeStyle = '#dc2626'; // red
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(9, 7, 4, 0, Math.PI * 1.5, false);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(11, 2, 2, 2); // swirl arrow
    ctx.restore();

    items.forEach(item => item.draw(ctx, cameraX));
    enemies.forEach(enemy => enemy.draw(ctx, cameraX));
    particles.forEach(p => p.draw(ctx, cameraX));
    if (sasuke) sasuke.draw(ctx, cameraX);
    player.draw(ctx, cameraX);

    // Draw retro "WIN!" message during hug cutscene
    if (gameState === 'hugging') {
        ctx.save();
        ctx.font = '40px "Press Start 2P"';
        ctx.fillStyle = '#fef08a'; // Golden Yellow
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.textAlign = 'center';
        
        // Glow effect
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 12;
        
        ctx.strokeText("WIN!", canvas.width / 2, canvas.height / 3);
        ctx.fillText("WIN!", canvas.width / 2, canvas.height / 3);
        ctx.restore();
    }
}

// Update DOM elements
function updateHUD() {
    if (!player) return;
    
    document.getElementById('scoreVal').innerText = String(player.score).padStart(6, '0');
    document.getElementById('coinsVal').innerText = '🍜 x' + String(player.coins).padStart(2, '0');
    document.getElementById('timeVal').innerText = String(Math.max(0, levelTime)).padStart(3, '0');
    document.getElementById('livesVal').innerText = '🍥 x' + String(Math.max(0, player.lives)).padStart(2, '0');
}

// Set game overlays and states
function setGameState(state) {
    gameState = state;

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameWinScreen').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');

    if (state === 'start_screen') {
        document.getElementById('startScreen').classList.remove('hidden');
        Sound.stopBGM();
    } else if (state === 'playing') {
        Sound.playBGM();
    } else if (state === 'paused') {
        document.getElementById('pauseScreen').classList.remove('hidden');
        Sound.stopBGM();
    } else if (state === 'game_over') {
        document.getElementById('gameOverScreen').classList.remove('hidden');
        Sound.stopBGM();
    }
}

// Keyboard input setup
window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', ' ', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code) || e.keyCode === 32) {
        e.preventDefault();
    }

    if (gameState === 'start_screen' && (e.key === 'Enter' || e.key === ' ')) {
        Sound.init();
        loadLevel('world1_1');
        setGameState('playing');
        return;
    }

    if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
            setGameState('paused');
        } else if (gameState === 'paused') {
            setGameState('playing');
        }
        return;
    }

    switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            keys.left = true;
            break;
        case 'arrowright':
        case 'd':
            keys.right = true;
            break;
        case 'arrowup':
        case 'w':
        case ' ':
            keys.jump = true;
            break;
        case 'arrowdown':
        case 's':
            keys.down = true;
            break;
        case 'shift':
        case 'x':
            keys.fire = true;
            keys.shift = true;
            break;
    }
});

window.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            keys.left = false;
            break;
        case 'arrowright':
        case 'd':
            keys.right = false;
            break;
        case 'arrowup':
        case 'w':
        case ' ':
            keys.jump = false;
            break;
        case 'arrowdown':
        case 's':
            keys.down = false;
            break;
        case 'shift':
        case 'x':
            keys.fire = false;
            keys.shift = false;
            break;
    }
});

// Mobile Gamepad touch listeners
function setupMobileControls() {
    const attachTouch = (id, action, pressValue) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        const handlerStart = (e) => {
            e.preventDefault();
            Sound.init();
            if (gameState === 'start_screen') {
                loadLevel('world1_1');
                setGameState('playing');
            }
            keys[action] = pressValue;
        };

        const handlerEnd = (e) => {
            e.preventDefault();
            keys[action] = !pressValue;
        };

        btn.addEventListener('touchstart', handlerStart, { passive: false });
        btn.addEventListener('touchend', handlerEnd, { passive: false });
        btn.addEventListener('mousedown', handlerStart);
        btn.addEventListener('mouseup', handlerEnd);
        btn.addEventListener('mouseleave', handlerEnd);
    };

    attachTouch('btnLeft', 'left', true);
    attachTouch('btnRight', 'right', true);
    attachTouch('btnJump', 'jump', true);
    attachTouch('btnFire', 'fire', true);

    const fireBtn = document.getElementById('btnFire');
    if (fireBtn) {
        fireBtn.addEventListener('touchstart', e => { keys.shift = true; });
        fireBtn.addEventListener('touchend', e => { keys.shift = false; });
        fireBtn.addEventListener('mousedown', e => { keys.shift = true; });
        fireBtn.addEventListener('mouseup', e => { keys.shift = false; });
    }
}

// GUI console buttons config
document.getElementById('startScreen').addEventListener('click', () => {
    Sound.init();
    if (gameState === 'start_screen') {
        loadLevel('world1_1');
        setGameState('playing');
    }
});

document.getElementById('pauseScreen').addEventListener('click', () => {
    if (gameState === 'paused') {
        setGameState('playing');
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    loadLevel('world1_1');
    setGameState('playing');
});

document.getElementById('nextLevelBtn').addEventListener('click', () => {
    loadLevel('world1_1');
    setGameState('playing');
});

document.getElementById('resetGameBtn').addEventListener('click', () => {
    loadLevel('world1_1');
    setGameState('playing');
});

const crtOverlay = document.getElementById('crtOverlay');
const crtToggleBtn = document.getElementById('crtToggleBtn');
crtToggleBtn.addEventListener('click', () => {
    const isActive = crtOverlay.classList.toggle('active');
    crtToggleBtn.innerText = `📺 HIỆU ỨNG CRT: ${isActive ? 'BẬT' : 'TẮT'}`;
    Sound.init();
});

const soundToggleBtn = document.getElementById('soundToggleBtn');
soundToggleBtn.addEventListener('click', () => {
    Sound.init();
    const isMuted = Sound.toggleMute();
    soundToggleBtn.innerText = `🔊 ÂM THANH: ${isMuted ? 'TẮT' : 'BẬT'}`;
});

// Setup & run
setupMobileControls();
requestAnimationFrame(gameUpdate);

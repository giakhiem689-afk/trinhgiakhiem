// Helper for checking rectangle intersection (AABB)
function rectIntersect(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

class Entity {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = width;
        this.height = height;
        this.type = type;
        
        this.isDead = false;
        this.isGrounded = false;
        this.gravity = 1100; // pixels/sec^2
        this.maxFallSpeed = 500;
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    update(dt, level) {
        if (this.isDead) return;

        // Apply gravity
        if (!this.isGrounded) {
            this.vy += this.gravity * dt;
            if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
        }

        // Horizontal movement & collision
        this.x += this.vx * dt;
        this.handleTileCollision(level, true);

        // Vertical movement & collision
        this.isGrounded = false;
        this.y += this.vy * dt;
        this.handleTileCollision(level, false);
    }

    handleTileCollision(level, isHorizontal) {
        const tileSize = 25;
        const startX = Math.max(0, Math.floor(this.x / tileSize));
        const endX = Math.floor((this.x + this.width) / tileSize);
        const startY = Math.max(0, Math.floor(this.y / tileSize));
        const endY = Math.floor((this.y + this.height) / tileSize);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                if (row >= level.height || col >= level.width) continue;
                
                const tile = level.map[row][col];
                if (tile && tile !== '.' && tile !== 'C' && tile !== 'F' && tile !== 'f' && tile !== 'h' && tile !== 'd') {
                    const tileRect = {
                        x: col * tileSize,
                        y: row * tileSize,
                        width: tileSize,
                        height: tileSize
                    };

                    if (rectIntersect(this.getRect(), tileRect)) {
                        if (isHorizontal) {
                            if (this.vx > 0) {
                                this.x = tileRect.x - this.width;
                                this.vx = 0;
                                this.onWallCollide();
                            } else if (this.vx < 0) {
                                this.x = tileRect.x + tileRect.width;
                                this.vx = 0;
                                this.onWallCollide();
                            }
                        } else {
                            if (this.vy > 0) {
                                this.y = tileRect.y - this.height;
                                this.vy = 0;
                                this.isGrounded = true;
                            } else if (this.vy < 0) {
                                this.y = tileRect.y + tileRect.height;
                                this.vy = 0;
                                this.onCeilingCollide(row, col, level);
                            }
                        }
                    }
                }
            }
        }
    }

    onWallCollide() {}
    onCeilingCollide(row, col, level) {}
}

// ==========================================
// NARUTO (PLAYER) CLASS
// ==========================================
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 20, 28, 'player'); // Start small
        
        this.state = 0; // 0 = Small Naruto, 1 = Sage Mode, 2 = Kurama Chakra Mode
        this.lives = 3;
        this.score = 0;
        this.coins = 0; // Ramen collected
        
        this.runSpeed = 160;
        this.maxSpeed = 245;
        this.acceleration = 650;
        this.friction = 0.88;
        this.jumpForce = -560; // Stronger jump to easily clear 5-block height
        
        this.runTimer = 0;
        this.isDashing = false;
        this.dashTrails = [];
        this.trailSpawnTimer = 0;
        
        this.direction = 1; // 1 = Right, -1 = Left
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;
        
        // Anim properties
        this.walkTimer = 0;
        this.walkFrame = 0;
        this.isCrouching = false;
        this.throwTimer = 0; // Throw Rasengan animation pose timer
        
        this.fireCooldown = 0;
        this.isDying = false;
        this.dyingTimer = 0;
        
        this.flagClimbing = false;
        this.flagClimbX = 0;
    }

    update(dt, keys, level, sound, spawnParticle, spawnItem) {
        if (this.isDying) {
            this.dyingTimer += dt;
            if (this.dyingTimer > 0.5) {
                this.vy += 1200 * dt;
                this.y += this.vy * dt;
            }
            return;
        }

        if (this.flagClimbing) {
            this.vx = 0;
            this.vy = 120; // slow slide
            this.y += this.vy * dt;
            
            const groundY = (level.height - 2) * 25;
            if (this.y + this.height >= groundY) {
                this.y = groundY - this.height;
                this.vy = 0;
                this.flagClimbing = false;
                this.autoWalkRight = true;
            }
            return;
        }

        // Support autoWalkRight by overriding key inputs
        if (this.autoWalkRight) {
            keys = {
                left: false,
                right: true,
                jump: false,
                down: false,
                shift: false,
                fire: false
            };

            // Auto jump if blocked by a wall or stone step
            const tileSize = 25;
            const frontX = this.x + this.width + 4;
            const colAhead = Math.floor(frontX / tileSize);
            const startRow = Math.floor(this.y / tileSize);
            const endRow = Math.floor((this.y + this.height - 2) / tileSize);
            
            let isBlocked = false;
            for (let r = startRow; r <= endRow; r++) {
                if (r >= 0 && r < level.height && colAhead >= 0 && colAhead < level.width) {
                    const tile = level.map[r][colAhead];
                    if (tile && tile !== '.' && tile !== 'C' && tile !== 'F' && tile !== 'f' && tile !== 'h' && tile !== 'd') {
                        isBlocked = true;
                        break;
                    }
                }
            }
            // Keep keys.jump true while in the air to prevent variable jump height from cutting the jump force early
            if ((isBlocked && this.isGrounded) || !this.isGrounded) {
                keys.jump = true;
            }
        }

        // Cooldowns
        if (this.fireCooldown > 0) this.fireCooldown -= dt;
        if (this.throwTimer > 0) this.throwTimer -= dt;
        
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }

        // Check continuous running direction to trigger dash
        const isMovingLeft = keys.left && this.vx < 0;
        const isMovingRight = keys.right && this.vx > 0;
        if ((isMovingLeft && this.direction === -1) || (isMovingRight && this.direction === 1)) {
            this.runTimer += dt;
        } else {
            this.runTimer = 0;
        }
        this.isDashing = (this.runTimer > 1.5);

        const speedMultiplier = (keys.shift ? 1.4 : 1.0) * (this.isDashing ? 1.45 : 1.0);
        const currentAccel = this.acceleration * speedMultiplier;
        const limitSpeed = this.maxSpeed * (keys.shift ? 1.35 : 1.0) * (this.isDashing ? 1.45 : 1.0);

        if (keys.left) {
            this.vx -= currentAccel * dt;
            this.direction = -1;
            if (this.vx < -limitSpeed) this.vx = -limitSpeed;
        } else if (keys.right) {
            this.vx += currentAccel * dt;
            this.direction = 1;
            if (this.vx > limitSpeed) this.vx = limitSpeed;
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 5) this.vx = 0;
        }

        // Spawn dash trail particles (throttled)
        if (this.isDashing && Math.abs(this.vx) > 50) {
            this.trailSpawnTimer += dt;
            if (this.trailSpawnTimer > 0.06) {
                this.dashTrails.push({
                    x: this.x,
                    y: this.y,
                    state: this.state,
                    direction: this.direction,
                    width: this.width,
                    height: this.height,
                    walkFrame: this.walkFrame,
                    isCrouching: this.isCrouching,
                    opacity: 0.65
                });
                this.trailSpawnTimer = 0;
            }
        }

        // Update existing dash trails
        this.dashTrails.forEach(trail => {
            trail.opacity -= dt * 3.5;
        });
        this.dashTrails = this.dashTrails.filter(trail => trail.opacity > 0);

        // Jump
        if (keys.jump && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            sound.playSFX('jump');
        }

        if (!keys.jump && this.vy < -100) {
            this.vy = -100;
        }

        // Crouch (Sage/Chakra Mode only)
        if (keys.down && this.isGrounded && this.state > 0) {
            this.isCrouching = true;
            this.vx *= 0.8;
            this.height = 34;
        } else {
            if (this.isCrouching) {
                this.isCrouching = false;
                this.height = 46;
                this.y -= 12;
            }
        }

        // Throw Rasengan/Rasenshuriken
        if (keys.fire && this.state === 2 && this.fireCooldown <= 0) {
            this.throwRasengan(spawnItem, sound);
        }

        super.update(dt, level);

        if (this.vx !== 0 && this.isGrounded) {
            this.walkTimer += dt * Math.abs(this.vx) * 0.08;
            this.walkFrame = Math.floor(this.walkTimer) % 3;
        } else {
            this.walkFrame = 0;
        }

        // Collect floating Ramen 'C'
        const tileSize = 25;
        const startX = Math.max(0, Math.floor(this.x / tileSize));
        const endX = Math.floor((this.x + this.width) / tileSize);
        const startY = Math.max(0, Math.floor(this.y / tileSize));
        const endY = Math.floor((this.y + this.height) / tileSize);
        for (let r = startY; r <= endY; r++) {
            for (let c = startX; c <= endX; c++) {
                if (r < level.height && c < level.width && level.map[r][c] === 'C') {
                    level.map[r] = level.map[r].substring(0, c) + '.' + level.map[r].substring(c + 1);
                    this.coins++;
                    this.score += 200;
                    sound.playSFX('coin');
                    spawnParticle(new ScoreText(c * tileSize + 12, r * tileSize, "200"));
                }
            }
        }

        if (this.y > level.height * 25) {
            this.die(sound);
        }

        // Clamp to left screen boundary (cannot walk backwards off-screen)
        const camX = typeof cameraX !== 'undefined' ? cameraX : 0;
        if (this.x < camX) {
            this.x = camX;
            if (this.vx < 0) this.vx = 0;
        }
    }

    throwRasengan(spawnItem, sound) {
        this.fireCooldown = 0.25;
        this.throwTimer = 0.15; // Set throw animation pose duration
        
        const fbX = this.direction === 1 ? this.x + this.width + 2 : this.x - 12;
        const fbY = this.y + this.height / 3;
        spawnItem(new Fireball(fbX, fbY, this.direction));
        sound.playSFX('fireball');
    }

    grow(sound) {
        if (this.state === 0) {
            this.state = 1; // Sage Mode
            this.height = 46;
            this.y -= 20;
            sound.playSFX('powerup');
        } else if (this.state === 1) {
            this.state = 2; // Nine-Tails Chakra Mode
            sound.playSFX('powerup');
        }
    }

    shrink(sound) {
        if (this.state > 0) {
            this.state = 0; // Back to Kid Naruto
            this.height = 28;
            this.isInvincible = true;
            this.invincibleTimer = 2.0;
            sound.playSFX('powerdown');
        } else {
            this.die(sound);
        }
    }

    die(sound) {
        if (this.isDying) return;
        this.isDying = true;
        this.dyingTimer = 0;
        this.vx = 0;
        this.vy = -350;
        this.lives--;
        sound.playSFX('die');
    }

    onCeilingCollide(row, col, level) {
        const tile = level.map[row][col];
        const tileSize = 25;
        const blockX = col * tileSize;
        const blockY = row * tileSize;

        level.bounceBlock(row, col);

        if (tile === 'B') {
            if (this.state > 0) {
                // Break block (ninja scroll/fist smash)
                level.map[row] = level.map[row].substring(0, col) + '.' + level.map[row].substring(col + 1);
                level.spawnDebris(blockX + tileSize/2, blockY + tileSize/2);
                this.score += 50;
            } else {
                level.playBounceSound();
            }
        } else if (tile === '?' || tile === 'M') {
            // Give Scroll (powerup item) - all reward blocks have equal value
            level.map[row] = level.map[row].substring(0, col) + 'S' + level.map[row].substring(col + 1);
            level.spawnPowerup(blockX, blockY, 'mushroom');
        }
    }

    draw(ctx, cameraX) {
        // Draw Dash Trails (afterimages)
        this.dashTrails.forEach(trail => {
            ctx.save();
            ctx.translate(Math.round(trail.x - cameraX), Math.round(trail.y));
            ctx.globalAlpha = trail.opacity;
            
            if (trail.direction === -1) {
                ctx.translate(trail.width, 0);
                ctx.scale(-1, 1);
            }
            
            // Glowing chakra afterimage silhouette
            let chakraColor = 'rgba(56, 189, 248, 0.4)'; // Blue chakra
            if (trail.state === 1) chakraColor = 'rgba(239, 68, 68, 0.45)'; // Red Sage cloak chakra
            if (trail.state === 2) chakraColor = 'rgba(251, 191, 36, 0.5)'; // Gold Kurama chakra
            
            ctx.fillStyle = chakraColor;
            ctx.fillRect(0, 0, trail.width, trail.height);
            ctx.restore();
        });

        ctx.save();
        ctx.translate(Math.round(this.x - cameraX), Math.round(this.y));

        if (this.isInvincible) {
            this.blinkTimer += 0.2;
            if (Math.floor(this.blinkTimer) % 2 === 0) {
                ctx.restore();
                return;
            }
        }

        if (this.direction === -1) {
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
        }

        const isBig = this.state > 0 && !this.isCrouching;
        const w = this.width;
        const h = this.height;

        if (this.isDying) {
            // Sad dizzy spiral eyes
            ctx.fillStyle = '#ff9900'; // Orange suit
            ctx.fillRect(2, 12, w-4, 12);
            ctx.fillStyle = '#ffcc99'; // Skin face
            ctx.fillRect(2, 6, w-4, 6);
            ctx.fillStyle = '#ffff00'; // Yellow hair
            ctx.fillRect(0, 0, w, 6);
            // Draw dead eyes (X X)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(5, 7); ctx.lineTo(8, 10);
            ctx.moveTo(8, 7); ctx.lineTo(5, 10);
            ctx.moveTo(10, 7); ctx.lineTo(13, 10);
            ctx.moveTo(13, 7); ctx.lineTo(10, 10);
            ctx.stroke();
            ctx.restore();
            return;
        }

        // --- DRAWING STYLES PER STATE ---
        if (this.state === 2) {
            // --- NINE-TAILS CHAKRA MODE (Golden glow, black outlines) ---
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffaa00';
            
            ctx.fillStyle = '#ffcc00'; // Gold energy body
            ctx.fillRect(2, h-18, 14, 14); // Legs & torso
            ctx.fillRect(4, 10, 10, h-24); // Chest
            
            // Arms
            ctx.fillStyle = '#ff9900';
            if (this.throwTimer > 0) {
                ctx.fillRect(12, h-26, 8, 4); // throw pose arm pointing forward
            } else if (this.walkFrame === 1 && this.vx !== 0) {
                ctx.fillRect(0, h-24, 4, 8);
                ctx.fillRect(14, h-20, 4, 8);
            } else {
                ctx.fillRect(0, h-22, 4, 8);
                ctx.fillRect(14, h-22, 4, 8);
            }
            
            // Head & spiky hair
            ctx.fillStyle = '#ffff33';
            ctx.fillRect(2, 4, 14, 8); // face
            // Spikes
            ctx.beginPath();
            ctx.moveTo(0, 4); ctx.lineTo(4, 0); ctx.lineTo(6, 4);
            ctx.moveTo(5, 4); ctx.lineTo(9, 0); ctx.lineTo(11, 4);
            ctx.moveTo(10, 4); ctx.lineTo(14, 0); ctx.lineTo(18, 4);
            ctx.fill();

            // Headband
            ctx.fillStyle = '#000000';
            ctx.fillRect(1, 8, 16, 2);
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(7, 8, 4, 2); // plate
            
            // Glowing chakra headband tails (waving behind head)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(1, 9);
            ctx.lineTo(-4, 11);
            ctx.lineTo(-3, 13);
            ctx.lineTo(1, 10);
            ctx.closePath();
            ctx.fill();

            // Black markings (Kurama patterns)
            ctx.fillStyle = '#000000';
            ctx.fillRect(7, h-12, 4, 2); // collar mark
            ctx.fillRect(5, h-8, 2, 2);
            ctx.fillRect(11, h-8, 2, 2);
            
        } else if (isBig) {
            // --- SAGE MODE (Orange suit + Red Cloak + Giant Scroll) ---
            // Draw Giant Scroll on Back
            ctx.fillStyle = '#8a8a8a'; // scroll roll gray
            ctx.fillRect(-4, h - 32, 6, 22);
            ctx.fillStyle = '#cc2222'; // scroll red handles
            ctx.fillRect(-5, h - 36, 8, 4);
            ctx.fillRect(-5, h - 10, 8, 4);

            // Red cloak body
            ctx.fillStyle = '#b31515';
            ctx.fillRect(2, h-24, 14, 18); // Cloak wrap

            // Legs (Orange)
            ctx.fillStyle = '#e65c00';
            ctx.fillRect(4, h-6, 4, 6);
            ctx.fillRect(10, h-6, 4, 6);
            ctx.fillStyle = '#222'; // shoes
            ctx.fillRect(3, h-2, 5, 2);
            ctx.fillRect(10, h-2, 5, 2);

            // Orange shirt/sleeves
            ctx.fillStyle = '#e65c00';
            if (this.walkFrame === 1 && this.vx !== 0) {
                ctx.fillRect(1, h-24, 4, 8); // Back arm
                ctx.fillRect(13, h-20, 5, 8); // Front arm
            } else {
                ctx.fillRect(1, h-22, 4, 8);
                ctx.fillRect(13, h-22, 4, 8);
            }

            // Face (Skin)
            ctx.fillStyle = '#ffcc99';
            ctx.fillRect(3, 10, 12, 12);
            
            // Sage orange eyeshadow markings
            ctx.fillStyle = '#ff5500';
            ctx.fillRect(8, 14, 4, 2); // eyes shadow border
            ctx.fillStyle = '#000000'; // eyes
            ctx.fillRect(10, 13, 2, 2);

            // Headband (Blue)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(2, 9, 14, 3);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(7, 9, 4, 3); // plate

            // Headband tails for Sage Mode
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(2, 10);
            ctx.lineTo(-4, 12);
            ctx.lineTo(-3, 14);
            ctx.lineTo(2, 11);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(2, 11);
            ctx.lineTo(-5, 16);
            ctx.lineTo(-4, 18);
            ctx.lineTo(2, 12);
            ctx.closePath();
            ctx.fill();

            // Spiky Yellow Hair
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(2, 4, 14, 5);
            // hair spikes path
            ctx.beginPath();
            ctx.moveTo(1, 4); ctx.lineTo(4, 0); ctx.lineTo(6, 4);
            ctx.moveTo(5, 4); ctx.lineTo(9, 0); ctx.lineTo(11, 4);
            ctx.moveTo(10, 4); ctx.lineTo(14, 0); ctx.lineTo(17, 4);
            ctx.fill();

        } else {
            // --- KID NARUTO (Small / Crouching) ---
            const sh = this.isCrouching ? 6 : 0;
            
            // Orange pants
            ctx.fillStyle = '#e65c00';
            ctx.fillRect(2, h-8, 12, 6);
            ctx.fillStyle = '#222'; // shoes
            ctx.fillRect(1, h-2, 5, 2);
            ctx.fillRect(10, h-2, 5, 2);
            
            // White leg bandage (iconic Naruto detail!)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, h-6, 4, 3);

            // Blue collar/shoulders, Orange torso
            ctx.fillStyle = '#0f172a'; // blue parts
            ctx.fillRect(2, h-14, 12, 3);
            ctx.fillStyle = '#e65c00'; // orange jacket
            ctx.fillRect(2, h-11, 12, 5);

            // Arm/Hand
            ctx.fillStyle = '#e65c00';
            if (this.throwTimer > 0) {
                ctx.fillRect(12, h-14, 7, 3); // arm pointing out
            } else if (this.walkFrame === 1 && this.vx !== 0) {
                ctx.fillRect(0, h-12, 3, 6);
                ctx.fillRect(13, h-10, 4, 6);
            } else {
                ctx.fillRect(0, h-11, 3, 6);
                ctx.fillRect(13, h-11, 3, 6);
            }

            // Face (Skin)
            ctx.fillStyle = '#ffcc99';
            ctx.fillRect(3, h-21, 10, 8);
            // Whisker markings on cheeks (3 lines each cheek, simplified)
            ctx.fillStyle = '#000000';
            ctx.fillRect(4, h-17, 2, 1);
            ctx.fillRect(10, h-17, 2, 1);
            ctx.fillRect(8, h-19, 2, 2); // eyes

            // Headband
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(2, h-24, 12, 3);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(6, h-24, 4, 3); // plate

            // Headband tails (vạt băng trán bay phấp phới behind head)
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(2, h-23);
            ctx.lineTo(-4, h-21);
            ctx.lineTo(-3, h-19);
            ctx.lineTo(2, h-22);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(2, h-22);
            ctx.lineTo(-5, h-17);
            ctx.lineTo(-4, h-15);
            ctx.lineTo(2, h-20);
            ctx.closePath();
            ctx.fill();

            // Spiky Hair
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.moveTo(1, h-23); ctx.lineTo(3, h-28); ctx.lineTo(6, h-23);
            ctx.moveTo(5, h-23); ctx.lineTo(8, h-28); ctx.lineTo(11, h-23);
            ctx.moveTo(10, h-23); ctx.lineTo(13, h-28); ctx.lineTo(16, h-23);
            ctx.fill();
        }

        if (typeof gameState !== 'undefined' && gameState === 'hugging') {
            // Draw hugging arm wrapped around Sasuke's back
            ctx.fillStyle = this.state === 2 ? '#ff9900' : '#e65c00';
            ctx.fillRect(10, h - 18, 14, 5); // extended arm to the right
        }

        ctx.restore();
    }
}

// ==========================================
// ENEMIES CLASSES (SAKURA CHIBI, SAkURA KAWARI)
// ==========================================
class Enemy extends Entity {
    constructor(x, y, width, height, type) {
        super(x, y, width, height, type);
        this.speed = -40;
        this.vx = this.speed;
        this.walkFrame = 0;
        this.walkTimer = 0;
        
        this.isSquished = false;
        this.squishTimer = 0;
        this.squishDuration = 0.55;
    }

    update(dt, level, sound) {
        if (this.isSquished) {
            this.squishTimer += dt;
            if (this.squishTimer >= this.squishDuration) {
                this.isDead = true;
            }
            return;
        }

        // --- Edge Detection for patrolling enemies (walking only) ---
        const isNormalWalking = this.type === 'goomba' || (this.type === 'koopa' && this.state === 'walking');
        if (isNormalWalking && this.isGrounded) {
            const tileSize = 25;
            const checkOffset = this.vx > 0 ? this.width + 4 : -4;
            const frontX = this.x + checkOffset;
            const tileX = Math.floor(frontX / tileSize);
            const tileY = Math.floor((this.y + this.height + 2) / tileSize);
            
            if (tileY < level.height && tileX >= 0 && tileX < level.width) {
                const tileBelow = level.map[tileY][tileX];
                if (!tileBelow || tileBelow === '.' || tileBelow === 'C' || tileBelow === 'F' || tileBelow === 'f' || tileBelow === 'h' || tileBelow === 'd') {
                    this.speed = -this.speed;
                    this.vx = this.speed;
                }
            }
        }

        super.update(dt, level);
        
        this.walkTimer += dt * 5;
        this.walkFrame = Math.floor(this.walkTimer) % 2;
    }

    onWallCollide() {
        this.speed = -this.speed;
        this.vx = this.speed;
    }

    squish(sound) {
        this.isSquished = true;
        this.squishTimer = 0;
        this.vx = 0;
        this.vy = 0;
        sound.playSFX('stomp');
    }
}

// Sakura Chibi (replaces Goomba)
class SakuraChibi extends Enemy {
    constructor(x, y) {
        // Keeps 'goomba' type to avoid modifying game.js physics engine logic
        super(x, y, 20, 28, 'goomba');
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(Math.round(this.x - cameraX), Math.round(this.y));

        const w = this.width;
        const h = this.height;

        if (this.isSquished) {
            // Squished flat Sakura (angry face / smoke effect)
            ctx.fillStyle = '#ffb3d9'; // Pink hair flat
            ctx.fillRect(0, h - 10, w, 10);
            ctx.fillStyle = '#e6005c'; // Red top flat
            ctx.fillRect(2, h - 4, w - 4, 4);
            // Angry tick mark
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(5, h - 8); ctx.lineTo(9, h - 4);
            ctx.moveTo(9, h - 8); ctx.lineTo(5, h - 4);
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Regular Sakura Chibi (scaled to 20x28)
        // Red Sleeveless Top/Dress
        ctx.fillStyle = '#e6005c';
        ctx.fillRect(2, 12, 16, 10);

        // Gray shorts/pants underdress
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(3, 22, 14, 4);

        // Pink Hair (Chibi Bob shape)
        ctx.fillStyle = '#ffb3d9';
        ctx.beginPath();
        ctx.arc(10, 8, 9, Math.PI, 0); // head dome
        ctx.fill();
        // Hair bangs down sides
        ctx.fillRect(1, 8, 3, 10);
        ctx.fillRect(16, 8, 3, 10);

        // Skin Face
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(4, 8, 12, 6);

        // Green eyes (iconic Sakura)
        ctx.fillStyle = '#00b33c';
        ctx.fillRect(6, 10, 2, 2);
        ctx.fillRect(12, 10, 2, 2);

        // Pink Headband on forehead
        ctx.fillStyle = '#e6005c';
        ctx.fillRect(3, 7, 14, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(8, 7, 4, 2); // metal plate

        // Shoes/Feet walking animation
        ctx.fillStyle = '#ffe4e6'; // pink sandals or skin
        if (this.walkFrame === 0) {
            ctx.fillRect(3, 26, 5, 2);
            ctx.fillRect(12, 26, 5, 2);
        } else {
            ctx.fillRect(2, 26, 5, 2);
            ctx.fillRect(13, 26, 5, 2);
        }

        ctx.restore();
    }
}

// Sakura Kawari (replaces Koopa)
class SakuraKawari extends Enemy {
    constructor(x, y) {
        // Keeps 'koopa' type for shell physics engine logic
        super(x, y, 22, 32, 'koopa');
        this.state = 'walking'; // 'walking', 'shell', 'movingShell'
        this.shellSpeed = 260;
    }

    update(dt, level, sound) {
        if (this.state === 'shell') {
            this.vx = 0;
            super.update(dt, level);
            return;
        }
        
        super.update(dt, level);
        
        if (this.state === 'walking') {
            this.walkTimer += dt * 4.5;
            this.walkFrame = Math.floor(this.walkTimer) % 2;
        }
    }

    squish(sound) {
        if (this.state === 'walking') {
            this.state = 'shell'; // substitution log
            this.height = 20;
            this.y += 12; // place log on ground
            this.vx = 0;
            this.speed = 0;
            sound.playSFX('stomp'); // Kawarimi sound
        }
    }

    kick(direction, sound) {
        this.state = 'movingShell';
        this.vx = direction * this.shellSpeed;
        sound.playSFX('stomp');
    }

    onWallCollide() {
        if (this.state === 'walking') {
            this.speed = -this.speed;
            this.vx = this.speed;
        } else if (this.state === 'movingShell') {
            this.vx = -this.vx;
        }
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(Math.round(this.x - cameraX), Math.round(this.y));

        if (this.state === 'shell' || this.state === 'movingShell') {
            // --- DRAW KAWARIMI LOG (Substitution Wood Block) ---
            ctx.save();
            if (this.state === 'movingShell') {
                // Spin the log when sliding!
                const spinAngle = (Date.now() * 0.01) % (Math.PI * 2);
                ctx.translate(11, 10);
                ctx.rotate(spinAngle);
                ctx.translate(-11, -10);
            }
            
            // Draw wood log body
            ctx.fillStyle = '#85582a'; // Brown bark
            ctx.fillRect(3, 0, 16, 20);
            
            // Draw growth rings at ends
            ctx.fillStyle = '#d6ad60'; // Inner wood
            ctx.fillRect(0, 0, 3, 20);
            ctx.fillRect(19, 0, 3, 20);
            
            ctx.strokeStyle = '#5a3d13';
            ctx.strokeRect(0, 0, 22, 20);
            
            // Tiny green leaf sticking out
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.moveTo(11, -1); ctx.quadraticCurveTo(6, -8, 7, -12); ctx.quadraticCurveTo(13, -8, 11, -1);
            ctx.fill();
            
            ctx.restore();
            ctx.restore();
            return;
        }

        // Draw regular Sakura (replaces Koopa) walking
        const isLeft = this.vx <= 0;
        ctx.save();
        if (!isLeft) {
            ctx.translate(22, 0);
            ctx.scale(-1, 1);
        }

        // Outfit (Red sleeveless top + shorts)
        ctx.fillStyle = '#e6005c';
        ctx.fillRect(2, 12, 14, 14); // red top
        ctx.fillStyle = '#4b5563'; // shorts
        ctx.fillRect(3, 24, 12, 3);

        // Skin limbs
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(10, 6, 6, 8); // neck/face stem
        ctx.fillRect(11, 0, 8, 8); // face

        // Hair Bob (Pink)
        ctx.fillStyle = '#ffb3d9';
        ctx.fillRect(6, 0, 8, 8); // back hair
        ctx.fillRect(11, -2, 7, 3); // top hair

        // Eye
        ctx.fillStyle = '#00b33c'; // Green eye
        ctx.fillRect(15, 2, 2, 2);

        // Feet walk
        ctx.fillStyle = '#ffcc99';
        if (this.walkFrame === 0) {
            ctx.fillRect(3, 26, 4, 6);
            ctx.fillRect(10, 25, 4, 7);
        } else {
            ctx.fillRect(2, 25, 4, 7);
            ctx.fillRect(11, 26, 4, 6);
        }

        ctx.restore();
        ctx.restore();
    }
}

// ==========================================
// ITEM CLASSES (SCROLL, RAMEN BOWL)
// ==========================================
class Item extends Entity {
    constructor(x, y, type) {
        super(x, y, 20, 20, type);
        
        this.isPoppingUp = true;
        this.popY = y - 22;
        this.vy = -40; // slowly pop out
        
        this.speed = 65;
        this.vx = 0;
    }

    update(dt, level) {
        if (this.isPoppingUp) {
            this.y += this.vy * dt;
            if (this.y <= this.popY) {
                this.y = this.popY;
                this.isPoppingUp = false;
                this.vy = 0;
                if (this.type === 'mushroom') {
                    this.vx = this.speed; // scroll moves
                }
            }
            return;
        }

        if (this.type === 'mushroom') {
            super.update(dt, level);
        }
    }

    onWallCollide() {
        this.vx = -this.vx;
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(Math.round(this.x - cameraX), Math.round(this.y));

        if (this.type === 'mushroom') {
            // --- DRAW NINJA SCROLL (Scroll item) ---
            // Cream scroll body
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(2, 4, 16, 12);
            ctx.strokeStyle = '#713f12';
            ctx.strokeRect(1.5, 3.5, 17, 13);
            
            // Red roll ends
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(0, 2, 3, 16);
            ctx.fillRect(17, 2, 3, 16);
            ctx.strokeStyle = '#450a0a';
            ctx.strokeRect(-0.5, 1.5, 4, 17);
            ctx.strokeRect(16.5, 1.5, 4, 17);

            // Black ribbon tie in middle
            ctx.fillStyle = '#000000';
            ctx.fillRect(9, 3, 2, 14);
        } else if (this.type === 'flower') {
            // --- DRAW SPECIAL RAMEN BOWL ---
            // Red/Gold bowl
            ctx.fillStyle = '#b91c1c';
            ctx.beginPath();
            ctx.arc(10, 11, 9, 0, Math.PI, false);
            ctx.closePath();
            ctx.fill();

            // Gold rim
            ctx.fillStyle = '#eab308';
            ctx.fillRect(1, 10, 18, 2);

            // Noodles (Yellow)
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(3, 7, 14, 4);

            // Narutomaki (White with pink spiral)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6, 6, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#ec4899';
            ctx.fillRect(5, 5, 2, 2); // pink center

            // Seaweed/Nori (Green/Black)
            ctx.fillStyle = '#14532d';
            ctx.fillRect(12, 3, 5, 6);
        }

        ctx.restore();
    }
}

// ==========================================
// RASENGAN / RASENSHURIKEN PROJECTILE
// ==========================================
class Fireball extends Entity {
    constructor(x, y, direction) {
        super(x, y, 14, 14, 'fireball');
        this.vx = direction * 280;
        this.vy = 40;
        this.bounceForce = -170;
        this.rotationAngle = 0;
    }

    update(dt, level) {
        super.update(dt, level);
        
        this.rotationAngle += 22 * dt; // Rapid rotation

        if (this.isGrounded) {
            this.vy = this.bounceForce;
            this.isGrounded = false;
        }

        if (this.y > level.height * 25) {
            this.isDead = true;
        }
    }

    onWallCollide() {
        this.isDead = true; // Explodes
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(Math.round(this.x - cameraX + 7), Math.round(this.y + 7));
        ctx.rotate(this.rotationAngle);

        // --- DRAW GLOWING BLUE RASENSHURIKEN / RASENGAN ---
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00d2ff';

        // Outer cyan spinning blades (shuriken look)
        ctx.fillStyle = 'rgba(0, 210, 255, 0.45)';
        ctx.beginPath();
        // 4 pointed blades
        ctx.moveTo(0, -11); ctx.lineTo(3, -3); ctx.lineTo(11, 0); ctx.lineTo(3, 3);
        ctx.lineTo(0, 11); ctx.lineTo(-3, 3); ctx.lineTo(-11, 0); ctx.lineTo(-3, -3);
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = '#00aacc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI*2);
        ctx.stroke();

        ctx.restore();
    }
}

// ==========================================
// POPPING RAMEN BOWL (Replaces PopCoin)
// ==========================================
class PopCoin {
    constructor(x, y) {
        this.x = x + 3;
        this.y = y;
        this.vy = -260;
        this.gravity = 1050;
        this.startY = y;
        this.isDead = false;
        this.angle = 0;
    }

    update(dt) {
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;
        this.angle += dt * 8;
        if (this.y > this.startY - 10 && this.vy > 0) {
            this.isDead = true;
        }
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        
        // Spin effect
        const scaleX = Math.abs(Math.sin(this.angle));
        ctx.scale(scaleX, 1);

        // Draw bowl of Ramen popping up
        ctx.fillStyle = '#b91c1c'; // Red bowl
        ctx.beginPath();
        ctx.arc(8, 9, 7, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fef08a'; // Noodles
        ctx.fillRect(2, 6, 12, 3);

        ctx.fillStyle = '#ffffff'; // White Narutomaki
        ctx.beginPath();
        ctx.arc(5, 5, 2, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}

// ==========================================
// PARTICLES
// ==========================================
class Particle {
    constructor(x, y, vx, vy, color, duration = 0.5) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.gravity = 800;
        this.life = duration;
        this.maxLife = duration;
        this.isDead = false;
    }

    update(dt) {
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.isDead = true;
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        ctx.fillStyle = this.color;
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
    }
}

class ScoreText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.vy = -60;
        this.life = 0.8;
        this.isDead = false;
        this.text = text;
    }

    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.isDead = true;
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life / 0.8})`;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        ctx.fillText(this.text, this.x - cameraX, this.y);
        ctx.restore();
    }
}

// ==========================================
// SASUKE CLASS
// ==========================================
class Sasuke extends Entity {
    constructor(x, y) {
        super(x, y, 20, 42, 'sasuke');
        this.vx = 0;
        this.vy = 0;
    }

    update(dt, level) {
        // Sasuke stands still, but is affected by gravity
        super.update(dt, level);
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(Math.round(this.x - cameraX), Math.round(this.y));

        // Draw Sasuke facing left (towards Naruto coming from left)
        ctx.scale(-1, 1);
        ctx.translate(-this.width, 0);

        const w = this.width;
        const h = this.height;

        // Charcoal/navy sandals
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, h-4, 5, 4);
        ctx.fillRect(13, h-4, 5, 4);

        // White trousers
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, h-22, 14, 18);

        // Purple Rope Belt (Obi) around waist
        ctx.fillStyle = '#a855f7'; 
        ctx.fillRect(1, h-26, 18, 4);
        // Rope loops hanging
        ctx.fillRect(4, h-22, 4, 10);
        ctx.fillRect(12, h-22, 4, 8);

        // Navy blue high-collar shirt
        ctx.fillStyle = '#1e1b4b'; 
        ctx.fillRect(2, 12, 16, 12);
        ctx.fillRect(2, 6, 3, 6);
        ctx.fillRect(15, 6, 3, 6);

        // Pale Skin Face
        ctx.fillStyle = '#ffe4e6'; 
        ctx.fillRect(4, 8, 12, 10);

        // Sharingan red eyes
        ctx.fillStyle = '#ef4444'; 
        ctx.fillRect(9, 11, 2, 2); 
        ctx.fillRect(13, 11, 2, 2); 

        // Sasuke's Black Hair (Obstructive bangs & back spikes)
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(3, 2, 14, 6); // top
        ctx.fillRect(3, 8, 3, 8); // left bang
        ctx.fillRect(14, 8, 3, 8); // right bang
        
        // Spiky back hair
        ctx.beginPath();
        ctx.moveTo(3, 2); ctx.lineTo(-1, -2); ctx.lineTo(3, 4);
        ctx.moveTo(6, 2); ctx.lineTo(4, -4); ctx.lineTo(8, 2);
        ctx.fill();

        if (typeof gameState !== 'undefined' && gameState === 'hugging') {
            // Draw Sasuke's arm wrapping around Naruto's back
            ctx.fillStyle = '#1e1b4b'; // Sasuke's navy blue shirt
            ctx.fillRect(8, 16, 16, 5); // extended arm pointing forward (to the left on screen)
        }

        ctx.restore();
    }
}

// ==========================================
// HEART PARTICLE (For Naruto & Sasuke Kiss)
// ==========================================
class HeartParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 35;
        this.vy = -50 - Math.random() * 40;
        this.life = 1.6;
        this.maxLife = 1.6;
        this.isDead = false;
        this.wobbleSpeed = 6 + Math.random() * 6;
        this.wobbleAmount = 4 + Math.random() * 4;
        this.time = 0;
    }

    update(dt) {
        this.time += dt;
        this.y += this.vy * dt;
        this.x += (this.vx + Math.sin(this.time * this.wobbleSpeed) * this.wobbleAmount) * dt;
        this.life -= dt;
        if (this.life <= 0) this.isDead = true;
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        ctx.fillStyle = '#ff3366'; // Glowing hot pink/rose heart
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Left lobe
        ctx.bezierCurveTo(-6, -6, -12, -2, 0, 10);
        // Right lobe
        ctx.bezierCurveTo(12, -2, 6, -6, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

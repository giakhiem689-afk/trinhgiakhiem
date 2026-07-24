import os
import shutil

# Directories
base_dir = "c:/Users/KHIEMTG/Desktop/Game"
mobile_dir = os.path.join(base_dir, "Mobile-Version")

# 1. Create mobile directory if not exists
os.makedirs(mobile_dir, exist_ok=True)

# 2. Files to copy
js_files = ["levels.js", "entities.js", "game.js", "sound.js"]
for js in js_files:
    src = os.path.join(base_dir, js)
    dst = os.path.join(mobile_dir, js)
    shutil.copy2(src, dst)
    print(f"Copied: {js} -> Mobile-Version/")

# 3. Write mobile-optimized index.html
mobile_html = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Naruto Shippuden - Mobile Chronicles</title>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="mobile-container">
        <!-- Stats HUD -->
        <div class="hud">
            <div class="hud-item"><span class="hud-label">NARUTO</span><span class="hud-value" id="scoreVal">000000</span></div>
            <div class="hud-item"><span class="hud-label">RAMEN</span><span class="hud-value" id="coinsVal">🍜 x00</span></div>
            <div class="hud-item"><span class="hud-label">WORLD</span><span class="hud-value" id="worldVal">1-1</span></div>
            <div class="hud-item"><span class="hud-label">TIME</span><span class="hud-value" id="timeVal">300</span></div>
            <div class="hud-item lives-hud"><span class="hud-label">LIVES</span><span class="hud-value" id="livesVal">🍥 x03</span></div>
        </div>

        <!-- Screen Area with Canvas -->
        <div class="screen-area">
            <div class="crt-overlay active" id="crtOverlay"></div>
            <canvas id="gameCanvas" width="640" height="400"></canvas>

            <!-- Start Screen Overlay -->
            <div class="game-overlay" id="startScreen">
                <div class="overlay-content">
                    <h2 class="game-logo">NARUTO<br><span>MOBILE</span></h2>
                    <p class="blink">CHẠM VÀO ĐÂY ĐỂ BẮT ĐẦU</p>
                </div>
            </div>

            <!-- Game Over Overlay -->
            <div class="game-overlay hidden" id="gameOverScreen">
                <div class="overlay-content">
                    <h2 class="game-over-text">MISSION FAILED</h2>
                    <button class="mobile-btn" id="restartBtn">CHƠI LẠI</button>
                </div>
            </div>

            <!-- Win Overlay -->
            <div class="game-overlay hidden" id="gameWinScreen">
                <div class="overlay-content">
                    <h2 class="game-win-text">MISSION CLEAR!</h2>
                    <div class="final-score-box">
                        <p>ĐIỂM: <span id="finalScore">000000</span></p>
                        <p>THỜI GIAN: <span id="finalTime">000</span></p>
                        <p>THƯỞNG: <span id="timeBonus">0000</span></p>
                    </div>
                    <button class="mobile-btn" id="nextLevelBtn">TIẾP TỤC</button>
                </div>
            </div>

            <!-- Pause Overlay -->
            <div class="game-overlay hidden" id="pauseScreen">
                <div class="overlay-content">
                    <h2 class="pause-text">PAUSED</h2>
                    <p>Chạm vào đây để tiếp tục</p>
                </div>
            </div>
        </div>

        <!-- Console Buttons -->
        <div class="console-buttons">
            <button class="console-btn" id="soundToggleBtn">🔊 ÂM THANH: BẬT</button>
            <button class="console-btn" id="crtToggleBtn">📺 CRT: BẬT</button>
            <button class="console-btn" id="resetGameBtn">🔄 RESET</button>
        </div>

        <!-- Virtual Gamepad (Always Visible on Mobile Version) -->
        <div class="mobile-gamepad">
            <div class="dpad">
                <button class="dpad-btn" id="btnLeft">◀</button>
                <div class="dpad-center"></div>
                <button class="dpad-btn" id="btnRight">▶</button>
            </div>
            <div class="action-buttons">
                <button class="action-btn btn-b" id="btnFire">B</button>
                <button class="action-btn btn-a" id="btnJump">A</button>
            </div>
        </div>
    </div>

    <!-- Game Scripts -->
    <script src="sound.js"></script>
    <script src="levels.js"></script>
    <script src="entities.js"></script>
    <script src="game.js"></script>
</body>
</html>
"""

with open(os.path.join(mobile_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(mobile_html)
print("Created: Mobile-Version/index.html")

# 4. Write mobile-optimized style.css
mobile_css = """* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
}

body {
    background-color: #111;
    color: #fff;
    font-family: 'Outfit', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden;
}

.mobile-container {
    width: 100%;
    max-width: 680px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #1a1a1a;
    border: 3px solid #ff6b00; /* Orange Chakra Border */
    box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
}

/* HUD Styling */
.hud {
    display: flex;
    justify-content: space-between;
    background: #000;
    padding: 8px 12px;
    border-bottom: 2px solid #ff6b00;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
}

.hud-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.hud-label {
    color: #ffaa00;
    margin-bottom: 4px;
}

.hud-value {
    color: #fff;
}

/* Screen Area */
.screen-area {
    position: relative;
    width: 100%;
    flex: 1;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

#gameCanvas {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Scales properly keeping aspect ratio */
}

/* Overlays */
.game-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.game-overlay.hidden {
    display: none;
}

.overlay-content {
    text-align: center;
    font-family: 'Press Start 2P', monospace;
}

.game-logo {
    font-size: 24px;
    color: #ff6b00;
    text-shadow: 0 0 10px rgba(255, 107, 0, 0.7);
    margin-bottom: 12px;
}

.game-logo span {
    color: #ff3366; /* Sakura Pink */
}

.blink {
    font-size: 10px;
    color: #00ffcc;
    animation: blinker 1.2s linear infinite;
    margin-top: 15px;
}

@keyframes blinker {
    50% { opacity: 0; }
}

.mobile-btn {
    margin-top: 15px;
    padding: 10px 20px;
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    background-color: #ff6b00;
    color: white;
    border: none;
    border-radius: 4px;
    box-shadow: 0 4px #b34a00;
}

.mobile-btn:active {
    transform: translateY(4px);
    box-shadow: none;
}

/* CRT Scanlines Overlay */
.crt-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
    background-size: 100% 4px;
    z-index: 8;
    pointer-events: none;
}

.crt-overlay.hidden {
    display: none;
}

/* Console Control Buttons */
.console-buttons {
    display: flex;
    justify-content: space-around;
    padding: 8px;
    background-color: #111;
    border-top: 2px solid #ff6b00;
}

.console-btn {
    padding: 6px 12px;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 11px;
    color: #fff;
    background-color: #333;
    border: 1px solid #ff6b00;
    border-radius: 4px;
}

.console-btn:active {
    background-color: #ff6b00;
}

/* Mobile Virtual Gamepad */
.mobile-gamepad {
    height: 180px;
    background-color: #111;
    border-top: 2px solid #ff6b00;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 25px;
}

.dpad {
    position: relative;
    width: 130px;
    height: 130px;
    background-color: #222;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px solid #ff6b00;
}

.dpad-btn {
    position: absolute;
    width: 44px;
    height: 44px;
    background-color: #333;
    border: 1px solid #ff6b00;
    color: #ff6b00;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
}

.dpad-btn:active {
    background-color: #ff6b00;
    color: #fff;
}

#btnLeft { left: 5px; }
#btnRight { right: 5px; }

.dpad-center {
    width: 30px;
    height: 30px;
    background-color: #111;
    border-radius: 50%;
}

.action-buttons {
    display: flex;
    gap: 20px;
}

.action-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    font-family: 'Press Start 2P', monospace;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 0 4px rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
}

.action-btn:active {
    transform: translateY(3px);
    box-shadow: none;
}

.btn-a {
    background-color: #ff3366; /* Pink jump button */
    border-color: #b30030;
}

.btn-b {
    background-color: #ff6b00; /* Orange run/fire button */
    border-color: #b34a00;
}
"""

with open(os.path.join(mobile_dir, "style.css"), "w", encoding="utf-8") as f:
    f.write(mobile_css)
print("Created: Mobile-Version/style.css")

print("SUCCESS: Mobile version package created successfully!")

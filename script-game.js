const game = document.getElementById("game");
const player = document.getElementById("player");

const skinSelector = document.getElementById("skinSelector");
const skinSelectorBtn = document.getElementById("skinSelectorBtn");
const skinSelectorOptions = document.getElementById("skinSelectorOptions");
const selectedSkinImg = document.getElementById("selectedSkinImg");
const selectedSkinText = document.getElementById("selectedSkinText");
const skinOptions = document.querySelectorAll(".skin-option");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const highScoreEl = document.getElementById("highScore");
const specialCountEl = document.getElementById("specialCount");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const finalScoreEl = document.getElementById("finalScore");
const finalCoinsEl = document.getElementById("finalCoins");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");

const shopBtn = document.getElementById("shopBtn");
const shopScreen = document.getElementById("shopScreen");
const closeShopBtn = document.getElementById("closeShopBtn");
const savedCoinsEl = document.getElementById("savedCoins");

const buyMacaBtn = document.getElementById("buyMacaBtn");
const buyPessegoBtn = document.getElementById("buyPessegoBtn");
const buyMangaBtn = document.getElementById("buyMangaBtn");
const buyPytaiaBtn = document.getElementById("buyPytaiaBtn");
const buyJumpBtn = document.getElementById("buyJumpBtn");

const shopMaca = document.getElementById("shopMaca");
const shopPessego = document.getElementById("shopPessego");
const shopManga = document.getElementById("shopManga");
const shopPytaia = document.getElementById("shopPytaia");

const playerTrail = document.getElementById("playerTrail");
const buyRainbowTrailBtn = document.getElementById("buyRainbowTrailBtn");
const shopRainbowTrail = document.getElementById("shopRainbowTrail");

const TRAIL_SEGMENTS_COUNT = 14;
const trailSegments = [];
const trailPoints = [];

const resetProgressBtn = document.getElementById("resetProgressBtn");

let GROUND_HEIGHT = 100;
let PLAYER_SIZE = 46;
let PLAYER_X = 70;
let COIN_SIZE = 40;
let OBSTACLE_WIDTH = 56;
let OBSTACLE_BOX_HEIGHT = 56;
let PLATFORM_WIDTH = 110;
let PLATFORM_HEIGHT = 22;
let OBSTACLE_BOTTOM = 85;

let selectedSkin = "skin-pessego";

let playerY = GROUND_HEIGHT;
let velocityY = 0;
let gravity = 1;
let jumpForce = 20;

let score = 0;
let coins = 0;
let specialCount = 0;
let highScore = Number(localStorage.getItem("cubeEscapeHighScore")) || 0;

let isRunning = false;
let isPaused = false;
let isGameOver = false;
let animationFrameId = null;
let shopOpenedFromGame = false;

let obstacles = [];
let coinsList = [];
let platforms = [];
let specialItems = [];

let platformTimer = 0;
let platformInterval = 220;
let specialTimer = 0;
let specialInterval = 700;
let obstacleTimer = 0;
let obstacleInterval = 95;
let coinTimer = 0;
let coinInterval = 140;
let gameSpeed = 5;

let savedCoins = Number(localStorage.getItem("cubeEscapeSavedCoins")) || 0;
let unlockedSkins = JSON.parse(localStorage.getItem("cubeEscapeUnlockedSkins")) || ["skin-pessego"];
let upgrades = JSON.parse(localStorage.getItem("cubeEscapeUpgrades")) || {
    betterJump: false
};

let cosmetics = JSON.parse(localStorage.getItem("cubeEscapeCosmetics")) || {
    rainbowTrailUnlocked: false,
    rainbowTrailEquipped: false
};

function getScreenTier() {
    if (window.innerWidth <= 360) return "xs";
    if (window.innerWidth <= 480) return "sm";
    if (window.innerWidth <= 768) return "md";
    return "lg";
}

function syncResponsiveValues() {
    const styles = getComputedStyle(document.documentElement);
    GROUND_HEIGHT = parseFloat(styles.getPropertyValue("--ground-height")) || 100;
    PLAYER_SIZE = parseFloat(styles.getPropertyValue("--player-size")) || 46;
    PLAYER_X = parseFloat(styles.getPropertyValue("--player-left")) || 70;
    OBSTACLE_WIDTH = parseFloat(styles.getPropertyValue("--obstacle-width")) || 56;
    OBSTACLE_BOX_HEIGHT = parseFloat(styles.getPropertyValue("--obstacle-box-size")) || 56;
    PLATFORM_WIDTH = parseFloat(styles.getPropertyValue("--platform-width")) || 110;
    PLATFORM_HEIGHT = parseFloat(styles.getPropertyValue("--platform-height")) || 22;
    OBSTACLE_BOTTOM = parseFloat(styles.getPropertyValue("--obstacle-bottom")) || 85;

    const tier = getScreenTier();
    COIN_SIZE = tier === "lg" ? 40 : 34;
}

function saveShopData() {
    localStorage.setItem("cubeEscapeSavedCoins", String(savedCoins));
    localStorage.setItem("cubeEscapeUnlockedSkins", JSON.stringify(unlockedSkins));
    localStorage.setItem("cubeEscapeUpgrades", JSON.stringify(upgrades));
    localStorage.setItem("cubeEscapeCosmetics", JSON.stringify(cosmetics));
}

function updateShopUI() {
    savedCoinsEl.textContent = savedCoins;

    const macaUnlocked = unlockedSkins.includes("skin-maca");
    const pessegoUnlocked = unlockedSkins.includes("skin-pessego");
    const mangaUnlocked = unlockedSkins.includes("skin-manga");
    const pytaiaUnlocked = unlockedSkins.includes("skin-pytaia");
    const rainbowUnlocked = cosmetics.rainbowTrailUnlocked;
    const rainbowEquipped = cosmetics.rainbowTrailEquipped;

    if (!rainbowUnlocked) {
        buyRainbowTrailBtn.textContent = "Comprar";
    } else if (rainbowEquipped) {
        buyRainbowTrailBtn.textContent = "Desequipar";
    } else {
        buyRainbowTrailBtn.textContent = "Equipar";
    }

    buyRainbowTrailBtn.disabled = false;

    shopRainbowTrail.classList.toggle("unlocked", rainbowUnlocked);
    shopRainbowTrail.classList.toggle("locked", !rainbowUnlocked);

    buyPessegoBtn.textContent = pessegoUnlocked ? "Desbloqueada" : "Comprar";
    buyMacaBtn.textContent = macaUnlocked ? "Desbloqueada" : "Comprar";
    buyMangaBtn.textContent = mangaUnlocked ? "Desbloqueada" : "Comprar";
    buyPytaiaBtn.textContent = pytaiaUnlocked ? "Desbloqueada" : "Comprar";
    buyJumpBtn.textContent = upgrades.betterJump ? "Comprado" : "Comprar";

    buyPessegoBtn.disabled = pessegoUnlocked;
    buyMacaBtn.disabled = macaUnlocked;
    buyMangaBtn.disabled = mangaUnlocked;
    buyPytaiaBtn.disabled = pytaiaUnlocked;
    buyJumpBtn.disabled = upgrades.betterJump;

    shopPessego.classList.toggle("unlocked", pessegoUnlocked);
    shopPessego.classList.toggle("locked", !pessegoUnlocked);
    shopMaca.classList.toggle("unlocked", macaUnlocked);
    shopMaca.classList.toggle("locked", !macaUnlocked);
    shopManga.classList.toggle("unlocked", mangaUnlocked);
    shopManga.classList.toggle("locked", !mangaUnlocked);
    shopPytaia.classList.toggle("unlocked", pytaiaUnlocked);
    shopPytaia.classList.toggle("locked", !pytaiaUnlocked);


}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("cubeEscapeHighScore", String(highScore));
        highScoreEl.textContent = highScore;
    }
}

function updateSelectedSkinUI() {
    const option = [...skinOptions].find((item) => item.dataset.value === selectedSkin);

    if (!option) return;

    const optionImg = option.querySelector(".skin-option-icon");
    selectedSkinText.textContent = option.dataset.label;
    selectedSkinImg.src = optionImg.src;
    selectedSkinImg.alt = option.dataset.label;
}

function ensureUnlockedSelectedSkin() {
    if (!unlockedSkins.includes(selectedSkin)) {
        selectedSkin = "skin-pessego";
    }
    updateSelectedSkinUI();
}

function applySkin() {
    ensureUnlockedSelectedSkin();
    player.className = "player";
    player.classList.add(selectedSkin);
}
function buyOrToggleRainbowTrail() {
    if (!cosmetics.rainbowTrailUnlocked) {
        if (savedCoins < 300) {
            alert("Moedas insuficientes!");
            return;
        }

        savedCoins -= 300;
        cosmetics.rainbowTrailUnlocked = true;
        cosmetics.rainbowTrailEquipped = true;
    } else {
        cosmetics.rainbowTrailEquipped = !cosmetics.rainbowTrailEquipped;
    }

    saveShopData();
    updateShopUI();
    setupTrail();
    updateTrail();
}

function setupTrail() {
    playerTrail.innerHTML = "";
    trailSegments.length = 0;
    trailPoints.length = 0;

    for (let i = 0; i < TRAIL_SEGMENTS_COUNT; i++) {
        const segment = document.createElement("div");
        segment.classList.add("trail-segment");
        playerTrail.appendChild(segment);
        trailSegments.push(segment);

        trailPoints.push({
            x: PLAYER_X,
            y: playerY
        });
    }
}
function setPlayerRotation() {
    const rotate = Math.max(-25, Math.min(25, velocityY * 2));
    player.style.setProperty("--player-rotation", `${rotate}deg`);
}

function openShop() {
    if (!startScreen.classList.contains("hidden") && !isRunning) {
        updateShopUI();
        shopScreen.classList.remove("hidden");
        return;
    }

    if (isRunning && !isPaused && !isGameOver) {
        shopOpenedFromGame = true;
        setPausedState(true);
    }

    updateShopUI();
    shopScreen.classList.remove("hidden");
}

function closeShop() {
    shopScreen.classList.add("hidden");

    if (shopOpenedFromGame && isRunning && isPaused && !isGameOver) {
        shopOpenedFromGame = false;
        setPausedState(false);
        animationFrameId = requestAnimationFrame(gameLoop);
    } else {
        shopOpenedFromGame = false;
    }
}

function buySkin(skinName, cost) {
    if (unlockedSkins.includes(skinName)) return;

    if (savedCoins < cost) {
        alert("Moedas insuficientes!");
        return;
    }

    savedCoins -= cost;
    unlockedSkins.push(skinName);
    saveShopData();
    updateShopUI();
    applySkin();
}

function buyBetterJump() {
    if (upgrades.betterJump) return;

    if (savedCoins < 150) {
        alert("Moedas insuficientes!");
        return;
    }

    savedCoins -= 150;
    upgrades.betterJump = true;
    jumpForce = 23;
    saveShopData();
    updateShopUI();
}

function jump() {
    if (!isRunning || isPaused || isGameOver) return;

    const onGround = playerY <= GROUND_HEIGHT + 2;
    const onPlatform = isPlayerOnPlatform();

    if (onGround || onPlatform) {
        velocityY = jumpForce;
        playSound(420, 0.08, "square");
    }
}

function createObstacle() {
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    const x = game.clientWidth + 10;
    const boxCount = Math.floor(Math.random() * 3) + 1;
    const tier = getScreenTier();
    const overlapPerBox = tier === "lg" ? 24 : tier === "md" ? 22 : tier === "sm" ? 20 : 18;

    for (let i = 0; i < boxCount; i++) {
        const box = document.createElement("div");
        box.classList.add("obstacle-box");
        obstacle.appendChild(box);
    }

    const totalHeight =
        boxCount === 1
            ? OBSTACLE_BOX_HEIGHT
            : boxCount * OBSTACLE_BOX_HEIGHT - (boxCount - 1) * overlapPerBox;

    obstacle.style.height = `${totalHeight}px`;
    obstacle.style.left = `${x}px`;

    game.appendChild(obstacle);

    obstacles.push({
        element: obstacle,
        x,
        width: OBSTACLE_WIDTH,
        height: totalHeight,
        passed: false
    });
}

function createCoin() {
    const coin = document.createElement("div");
    coin.classList.add("coin");

    const x = game.clientWidth + 10;
    const spawnType = Math.random() < 0.5 ? "ground" : "floating";
    let y;

    if (spawnType === "ground") {
        y = GROUND_HEIGHT + 8;
    } else {
        const minY = GROUND_HEIGHT + 90;
        const maxY = Math.max(GROUND_HEIGHT + 140, game.clientHeight - 240);
        y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    }

    coin.style.left = `${x}px`;
    coin.style.bottom = `${y}px`;

    game.appendChild(coin);

    coinsList.push({
        element: coin,
        x,
        y,
        size: COIN_SIZE
    });
}

function createCoinRowOnPlatform(platform) {
    const tier = getScreenTier();
    const coinSpacing = COIN_SIZE + (tier === "lg" ? 8 : 6);
    const totalWidth = COIN_SIZE * 3 + (coinSpacing - COIN_SIZE) * 2;
    const startX = platform.x + (platform.width - totalWidth) / 2;
    const y = platform.y + platform.height + 10;

    for (let i = 0; i < 3; i++) {
        const coin = document.createElement("div");
        coin.classList.add("coin");

        const x = startX + i * coinSpacing;

        coin.style.left = `${x}px`;
        coin.style.bottom = `${y}px`;

        game.appendChild(coin);

        coinsList.push({
            element: coin,
            x,
            y,
            size: COIN_SIZE
        });
    }
}

function createSpecialItem() {
    const specialItem = document.createElement("div");
    specialItem.classList.add("special-item");

    const x = game.clientWidth + 10;
    const minY = GROUND_HEIGHT + 90;
    const maxY = Math.max(GROUND_HEIGHT + 140, game.clientHeight - 240);
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    specialItem.style.left = `${x}px`;
    specialItem.style.bottom = `${y}px`;

    game.appendChild(specialItem);

    specialItems.push({
        element: specialItem,
        x,
        y,
        size: 42
    });
}
function updateTrailPosition() {
    if (!cosmetics.rainbowTrailEquipped) return;
    if (!trailPoints.length || !trailSegments.length) return;

    const headX = PLAYER_X -1;
    const headY = playerY + PLAYER_SIZE / 2 - 0;

    const segmentSpacing = 5;
    const verticalInfluence = 0.90;

    for (let i = 0; i < trailPoints.length; i++) {
        const targetX = headX - i * segmentSpacing;

        let targetY = headY;

        if (i > 0) {
            targetY = trailPoints[i - 1].y;
        }

        const softY = headY + (targetY - headY) * verticalInfluence;

        if (i === 0) {
            trailPoints[i].x += (targetX - trailPoints[i].x) * 0.75;
            trailPoints[i].y += (headY - trailPoints[i].y) * 0.40;
        } else {
            trailPoints[i].x += (targetX - trailPoints[i].x) * 0.55;
            trailPoints[i].y += (softY - trailPoints[i].y) * 0.18;
        }
    }

    trailSegments.forEach((segment, index) => {
        const point = trailPoints[index];
        const prev = index === 0 ? { x: headX, y: headY } : trailPoints[index - 1];

        const dx = prev.x - point.x;
        const dy = (prev.y - point.y) * 0.32;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        const scaleX = Math.max(0.4, 1 - index * 0.045);
        const scaleY = Math.max(0.5, 1 - index * 0.025);
        const opacity = Math.max(0.1, 0.9 - index * 0.06);

        segment.style.left = `${point.x-20}px`;
        segment.style.bottom = `${point.y-17}px`;
        segment.style.transform = `rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
        segment.style.opacity = `${opacity}`;
    });
}
function createPlatform() {
    const platform = document.createElement("div");
    platform.classList.add("platform");

    const width = PLATFORM_WIDTH;
    const height = PLATFORM_HEIGHT;
    const x = game.clientWidth + 20;
    const minY = GROUND_HEIGHT + 90;
    const maxY = Math.max(GROUND_HEIGHT + 140, game.clientHeight - 220);
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    platform.style.width = `${width}px`;
    platform.style.height = `${height}px`;
    platform.style.left = `${x}px`;
    platform.style.bottom = `${y}px`;

    game.appendChild(platform);

    const platformData = {
        element: platform,
        x,
        y,
        width,
        height
    };

    platforms.push(platformData);
    createCoinRowOnPlatform(platformData);
}

function updatePlayer() {
    const supportingPlatform = getSupportingPlatform();

    if (supportingPlatform && velocityY <= 0) {
        playerY = supportingPlatform.y + supportingPlatform.height;
        velocityY = 0;
    } else {
        velocityY -= gravity;
        playerY += velocityY;

        const landedOnPlatform = checkPlatformCollision();

        if (!landedOnPlatform && playerY <= GROUND_HEIGHT) {
            playerY = GROUND_HEIGHT;
            velocityY = 0;
        }
    }

    player.style.bottom = `${playerY}px`;
    setPlayerRotation();
}
function updateTrail() {
    if (cosmetics.rainbowTrailEquipped && isRunning && !isGameOver) {
        playerTrail.classList.remove("hidden");
    } else {
        playerTrail.classList.add("hidden");
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;
        obs.element.style.left = `${obs.x}px`;

        if (!obs.passed && obs.x + obs.width < PLAYER_X) {
            obs.passed = true;
            score++;
            scoreEl.textContent = score;
            updateHighScore();

            if (score % 5 === 0) {
                gameSpeed += 0.35;
                if (obstacleInterval > 60) obstacleInterval -= 3;
                if (coinInterval > 90) coinInterval -= 2;
            }
        }

        if (obs.x + obs.width < -80) {
            obs.element.remove();
            obstacles.splice(i, 1);
        }
    }
}

function updateCoins() {
    for (let i = coinsList.length - 1; i >= 0; i--) {
        const coin = coinsList[i];
        coin.x -= gameSpeed;
        coin.element.style.left = `${coin.x}px`;

        if (coin.x + coin.size < -50) {
            coin.element.remove();
            coinsList.splice(i, 1);
        }
    }
}

function updateSpecialItems() {
    for (let i = specialItems.length - 1; i >= 0; i--) {
        const item = specialItems[i];
        item.x -= gameSpeed;
        item.element.style.left = `${item.x}px`;

        if (item.x + item.size < -50) {
            item.element.remove();
            specialItems.splice(i, 1);
        }
    }
}

function updatePlatforms() {
    for (let i = platforms.length - 1; i >= 0; i--) {
        const platform = platforms[i];
        platform.x -= gameSpeed;
        platform.element.style.left = `${platform.x}px`;

        if (platform.x + platform.width < -140) {
            platform.element.remove();
            platforms.splice(i, 1);
        }
    }
}

function getPlayerRect() {
    const tier = getScreenTier();

    const insetX = tier === "lg" ? 6 : tier === "md" ? 5 : 4;
    const insetTop = tier === "lg" ? 5 : 4;
    const insetBottom = tier === "lg" ? 4 : 3;

    return {
        x: PLAYER_X + insetX,
        y: game.clientHeight - playerY - PLAYER_SIZE + insetTop,
        width: PLAYER_SIZE - insetX * 2,
        height: PLAYER_SIZE - insetTop - insetBottom
    };
}

function isPlayerOnPlatform() {
    const tier = getScreenTier();
    const inset = tier === "lg" ? 8 : 6;

    for (const platform of platforms) {
        const platformTop = platform.y + platform.height;
        const platformLeft = platform.x;
        const platformRight = platform.x + platform.width;

        const playerLeft = PLAYER_X;
        const playerRight = PLAYER_X + PLAYER_SIZE;

        const overlapX =
            playerRight > platformLeft + inset &&
            playerLeft < platformRight - inset;

        const touchingTop = Math.abs(playerY - platformTop) <= 4;

        if (overlapX && touchingTop) {
            return true;
        }
    }

    return false;
}

function getSupportingPlatform() {
    const tier = getScreenTier();
    const inset = tier === "lg" ? 6 : 5;

    for (const platform of platforms) {
        const platformTop = platform.y + platform.height;
        const platformLeft = platform.x;
        const platformRight = platform.x + platform.width;

        const playerLeft = PLAYER_X + inset;
        const playerRight = PLAYER_X + PLAYER_SIZE - inset;

        const overlapX = playerRight > platformLeft && playerLeft < platformRight;
        const standingOnTop = Math.abs(playerY - platformTop) <= 6;

        if (overlapX && standingOnTop) {
            return platform;
        }
    }

    return null;
}

function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function checkObstacleCollision() {
    const playerRect = getPlayerRect();
    const tier = getScreenTier();

    const obstaclePaddingX = tier === "lg" ? 8 : tier === "md" ? 7 : 6;
    const obstaclePaddingTop = tier === "lg" ? 6 : 5;
    const obstaclePaddingBottom = tier === "lg" ? 4 : 3;

    for (const obs of obstacles) {
        const obstacleRect = {
            x: obs.x + obstaclePaddingX,
            y: game.clientHeight - OBSTACLE_BOTTOM - obs.height + obstaclePaddingTop,
            width: obs.width - obstaclePaddingX * 2,
            height: obs.height - obstaclePaddingTop - obstaclePaddingBottom
        };

        if (isColliding(playerRect, obstacleRect)) {
            endGame();
            return;
        }
    }
}

function checkCoinCollection() {
    const playerRect = getPlayerRect();

    for (let i = coinsList.length - 1; i >= 0; i--) {
        const coin = coinsList[i];
        const coinRect = {
            x: coin.x,
            y: game.clientHeight - coin.y - coin.size,
            width: coin.size,
            height: coin.size
        };

        if (isColliding(playerRect, coinRect)) {
            coin.element.remove();
            coinsList.splice(i, 1);
            coins++;
            coinsEl.textContent = coins;
            playSound(880, 0.06, "triangle");
        }
    }
}

function checkSpecialCollection() {
    const playerRect = getPlayerRect();

    for (let i = specialItems.length - 1; i >= 0; i--) {
        const item = specialItems[i];
        const itemRect = {
            x: item.x,
            y: game.clientHeight - item.y - item.size,
            width: item.size,
            height: item.size
        };

        if (isColliding(playerRect, itemRect)) {
            item.element.remove();
            specialItems.splice(i, 1);
            specialCount++;
            specialCountEl.textContent = specialCount;
            playVictorySound();
        }
    }
}

function checkPlatformCollision() {
    const playerRect = getPlayerRect();
    const tier = getScreenTier();
    const platformInset = tier === "lg" ? 8 : 6;

    for (const platform of platforms) {
        const platformRect = {
            x: platform.x,
            y: game.clientHeight - platform.y - platform.height,
            width: platform.width,
            height: platform.height
        };

        const playerBottomScreen = playerRect.y + playerRect.height;
        const playerTopScreen = playerRect.y;

        const overlapX =
            playerRect.x + playerRect.width > platformRect.x + platformInset &&
            playerRect.x < platformRect.x + platformRect.width - platformInset;

        const isAbovePlatform =
            playerBottomScreen >= platformRect.y &&
            playerTopScreen < platformRect.y;

        const closeEnoughToTop = Math.abs(playerBottomScreen - platformRect.y) <= 12;

        if (overlapX && velocityY <= 0 && isAbovePlatform && closeEnoughToTop) {
            playerY = platform.y + platform.height;
            velocityY = 0;
            return true;
        }
    }

    return false;
}

function clearEntities() {
    obstacles.forEach((obs) => obs.element.remove());
    coinsList.forEach((coin) => coin.element.remove());
    platforms.forEach((platform) => platform.element.remove());
    specialItems.forEach((item) => item.element.remove());

    obstacles = [];
    coinsList = [];
    platforms = [];
    specialItems = [];
}

function setPausedState(paused) {
    isPaused = paused;
    game.classList.toggle("is-paused", paused);

    if (paused) {
        pauseScreen.classList.remove("hidden");
        pauseBtn.textContent = "Continuar";
    } else {
        pauseScreen.classList.add("hidden");
        pauseBtn.textContent = "Pausar";
    }

    updateTrail();
}

function startGame() {
    syncResponsiveValues();
    clearEntities();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    score = 0;
    coins = 0;
    specialCount = 0;
    playerY = GROUND_HEIGHT;
    velocityY = 0;
    obstacleTimer = 0;
    coinTimer = 0;
    platformTimer = 0;
    specialTimer = 0;
    obstacleInterval = 95;
    coinInterval = 140;
    platformInterval = 220;
    specialInterval = 420;
    gameSpeed = 5;
    jumpForce = upgrades.betterJump ? 23 : 20;

    isRunning = true;
    isGameOver = false;
    shopOpenedFromGame = false;
    setPausedState(false);

    specialCountEl.textContent = specialCount;
    scoreEl.textContent = score;
    coinsEl.textContent = coins;
    highScoreEl.textContent = highScore;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    shopScreen.classList.add("hidden");

    applySkin();
    player.style.bottom = `${playerY}px`;
    setPlayerRotation();
    setupTrail();
    updateTrail();
    updateTrailPosition();

    playSound(320, 0.08, "sine");
    animationFrameId = requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!isRunning || isGameOver || !shopScreen.classList.contains("hidden")) return;

    setPausedState(!isPaused);

    if (!isPaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    isGameOver = true;
    isRunning = false;
    shopOpenedFromGame = false;
    setPausedState(false);

    finalScoreEl.textContent = score;
    finalCoinsEl.textContent = coins;
    gameOverScreen.classList.remove("hidden");

    savedCoins += coins;
    saveShopData();
    updateShopUI();
    updateHighScore();
    updateTrail();
    playSound(160, 0.25, "sawtooth");
}

function gameLoop() {
    if (!isRunning || isPaused || isGameOver) return;

    updatePlayer();
    updateObstacles();
    updatePlatforms();
    updateCoins();
    updateSpecialItems();
    updateTrailPosition();

    checkObstacleCollision();
    checkCoinCollection();
    checkSpecialCollection();

    obstacleTimer++;
    platformTimer++;
    coinTimer++;
    specialTimer++;

    if (obstacleTimer >= obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;
    }

    if (platformTimer >= platformInterval) {
        createPlatform();
        platformTimer = 0;
    }

    if (coinTimer >= coinInterval) {
        createCoin();
        coinTimer = 0;
    }

    if (specialTimer >= specialInterval) {
        createSpecialItem();
        specialTimer = 0;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function playSound(frequency = 440, duration = 0.1, type = "sine") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);

    oscillator.onended = () => {
        audioContext.close();
    };
}

function playVictorySound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = audioContext.currentTime;

    notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.001, now + index * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.05, now + index * 0.08 + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.16);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(now + index * 0.08);
        oscillator.stop(now + index * 0.08 + 0.16);
    });

    setTimeout(() => {
        audioContext.close();
    }, 600);
}

function resetProgress() {
    localStorage.setItem("cubeEscapeHighScore", "0");
    localStorage.setItem("cubeEscapeSavedCoins", "0");
    localStorage.setItem("cubeEscapeUnlockedSkins", JSON.stringify(["skin-pessego"]));
    localStorage.setItem("cubeEscapeUpgrades", JSON.stringify({ betterJump: false }));
    location.reload();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
resetProgressBtn.addEventListener("click", resetProgress);

skinSelectorBtn.addEventListener("click", () => {
    const isHidden = skinSelectorOptions.classList.toggle("hidden");
    skinSelectorBtn.setAttribute("aria-expanded", String(!isHidden));
});

skinOptions.forEach((option) => {
    option.addEventListener("click", () => {
        selectedSkin = option.dataset.value;
        updateSelectedSkinUI();
        skinSelectorOptions.classList.add("hidden");
        skinSelectorBtn.setAttribute("aria-expanded", "false");
        applySkin();
    });
});

document.addEventListener("click", (event) => {
    if (!skinSelector.contains(event.target)) {
        skinSelectorOptions.classList.add("hidden");
        skinSelectorBtn.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        if (!startScreen.classList.contains("hidden") || isGameOver || !shopScreen.classList.contains("hidden")) return;
        jump();
    }

    if (event.code === "KeyP") {
        togglePause();
    }

    if (event.code === "Escape" && !shopScreen.classList.contains("hidden")) {
        closeShop();
    }
});

game.addEventListener("click", (event) => {
    const clickedButton = event.target.closest("button");
    if (clickedButton) return;
    if (!startScreen.classList.contains("hidden")) return;
    if (!shopScreen.classList.contains("hidden")) return;

    jump();
});

game.addEventListener(
    "touchstart",
    (event) => {
        const targetTag = event.target.tagName.toLowerCase();

        if (
            targetTag === "button" ||
            !startScreen.classList.contains("hidden") ||
            !shopScreen.classList.contains("hidden")
        ) {
            return;
        }

        jump();
    },
    { passive: true }
);

window.addEventListener("resize", () => {
    syncResponsiveValues();
});

shopBtn.addEventListener("click", openShop);
closeShopBtn.addEventListener("click", closeShop);

buyPessegoBtn.addEventListener("click", () => buySkin("skin-pessego", 0));
buyMacaBtn.addEventListener("click", () => buySkin("skin-maca", 75));
buyMangaBtn.addEventListener("click", () => buySkin("skin-manga", 50));
buyPytaiaBtn.addEventListener("click", () => buySkin("skin-pytaia", 500));
buyRainbowTrailBtn.addEventListener("click", buyOrToggleRainbowTrail);
buyJumpBtn.addEventListener("click", buyBetterJump);

highScoreEl.textContent = highScore;
syncResponsiveValues();
updateShopUI();
ensureUnlockedSelectedSkin();
applySkin();
setPlayerRotation();
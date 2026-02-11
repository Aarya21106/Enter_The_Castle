export class Game {
    constructor(canvasId, userId, initialHighScore = 0, onGameEnd = null) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.userId = userId;
        this.highScore = initialHighScore;
        this.onGameEndCallback = onGameEnd;

        // Constants
        this.GAME_WIDTH = 400;
        this.GAME_HEIGHT = 800;
        this.BASE_SPEED = 3.0;
        this.MAX_SPEED = 9.0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Assets
        this.assets = {
            shield: new Image(),
            timeOrb: new Image(),
            shuriken: new Image(),
            enemy: new Image(),
            bg: new Image(),
            bg2: new Image(),
            player: new Image()
        };
        this.assets.shield.src = 'assets/element_1.png?v=2.9';
        this.assets.timeOrb.src = 'assets/element_0.png?v=2.9';
        this.assets.shuriken.src = 'assets/element_4old.png?v=4.0';
        this.assets.enemy.src = 'assets/element_3.png?v=2.9';
        this.assets.bg.src = 'assets/background_game.png?v=4.0';
        this.assets.bg2.src = 'assets/background_ice.png?v=2.9';
        this.assets.player.src = 'assets/IMG_1226.PNG?v=2.9';

        // Inputs
        this.canvas.addEventListener('mousedown', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleInput(); });

        this.reset();
    }

    resize() {
        this.canvas.width = this.GAME_WIDTH;
        this.canvas.height = this.GAME_HEIGHT;
    }

    reset() {
        this.isRunning = false;
        this.isGameOver = false;
        this.timeSurvived = 0;
        this.distanceTravelled = 0;
        this.score = 0;
        this.currentSpeed = this.BASE_SPEED;

        this.ICE_PHASE_DIST = 2500;
        this.speedTimer = 0;

        this.phaser = 'NORMAL';

        this.hasShield = false;
        this.timeSlowActive = false;
        this.hasShield = false;
        this.timeSlowActive = false;
        this.timeSlowTimer = 0;

        this.highScoreBeaten = false;

        // Debug
        this.timeSlowTimer = 0;
        this.speedTimer = 0;

        this.ninja = new Ninja(this);
        this.world = new World(this);
        this.lastTime = 0;
    }

    start() {
        if (this.isRunning) return;
        this.reset();
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    handleInput() {
        if (this.isGameOver) {
            this.start();
        } else {
            this.ninja.switchGravity();
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        if (!this.isGameOver) requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        let effectiveDt = dt;
        if (this.timeSlowActive) {
            effectiveDt *= 0.5;
            this.timeSlowTimer -= dt;
            if (this.timeSlowTimer <= 0) {
                this.timeSlowActive = false;
                this.timeSlowTimer = 0;
            }
        }

        this.timeSurvived += effectiveDt;
        this.distanceTravelled += this.currentSpeed * effectiveDt * 10;

        this.updateDifficulty(dt);
        this.ninja.update(effectiveDt);
        this.world.update(effectiveDt);


    }

    updateDifficulty(dt) {
        const t = this.timeSurvived;
        const d = this.distanceTravelled;

        // Phase Logic
        if (d > 5000) {
            this.phase = 'ABYSS';
            this.speedTimer += dt;
            // Tremendous speed increase after 5000
            if (this.speedTimer >= 2.0) { // Every 2 seconds
                this.speedTimer = 0;
                this.currentSpeed += 0.8; // Huge jumps
                if (this.currentSpeed > 25.0) this.currentSpeed = 25.0; // Higher cap
            }
        } else if (d > this.ICE_PHASE_DIST) {
            this.phase = 'ICE_HELL';

            // Speed increase.
            this.speedTimer += dt;
            if (this.speedTimer >= 4.0) { // Slightly faster rate than before
                this.speedTimer = 0;
                this.currentSpeed += 0.4;
                if (this.currentSpeed > 16.0) this.currentSpeed = 16.0;
            }
        } else {
            this.speedTimer = 0;
            if (t <= 5) this.phase = 'TRIAL';
            else if (t <= 10) this.phase = 'INTRO';
            else if (t <= 20) this.phase = 'AXIS';
            else if (t <= 35) this.phase = 'THREAT';
            else if (t <= 45) this.phase = 'CORE';
            else this.phase = 'INTENSE';

            // High Score Check
            if (!this.highScoreBeaten && this.highScore > 0 && this.distanceTravelled > this.highScore) {
                this.highScoreBeaten = true;
                const overlay = document.getElementById('new-high-score-overlay');
                if (overlay) {
                    overlay.classList.remove('hidden');
                    setTimeout(() => overlay.classList.add('hidden'), 2000);
                }
            }

            // Standard progression
            if (t > 5 && this.currentSpeed < this.MAX_SPEED) {
                let r = t > 30 ? 0.07 : 0.045;
                this.currentSpeed += r * dt;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background
        let currentBg = this.assets.bg;

        if (this.distanceTravelled >= this.ICE_PHASE_DIST && this.assets.bg2.complete) {
            currentBg = this.assets.bg2;
        }

        if (currentBg.complete) {
            this.ctx.drawImage(currentBg, 0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        } else {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        }

        this.world.draw(this.ctx);
        this.ninja.draw(this.ctx);

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Inter';
        this.ctx.fillText(`Dist: ${Math.floor(this.distanceTravelled)}m`, 20, 60);

        if (this.hasShield) this.ctx.drawImage(this.assets.shield, 20, 80, 40, 40);

        if (this.isGameOver) this.drawGameOver();
    }

    drawGameOver() {
        // Handled by DOM overlay in script.js now
    }

    endGame() {
        this.isRunning = false;
        this.isGameOver = true;

        // Check High Score
        const currentScore = Math.floor(this.distanceTravelled);
        if (currentScore > this.highScore) {
            this.highScore = currentScore;
            // Trigger callback to save
            if (this.onGameEndCallback) {
                this.onGameEndCallback(this.distanceTravelled);
            }
        }

        this.draw();
    }
}

class Ninja {
    constructor(game) {
        this.game = game;
        this.width = 65; // resized
        this.height = 65; // resized
        this.reset();
    }

    reset() {
        this.side = 'left';
        this.x = 10;
        this.y = this.game.GAME_HEIGHT - 200;
        this.targetX = 10;
        this.lerpSpeed = 0.25;
    }

    switchGravity() {
        if (this.side === 'left') {
            this.side = 'right';
            this.targetX = this.game.GAME_WIDTH - this.width - 10;
        } else {
            this.side = 'left';
            this.targetX = 10;
        }
    }

    update(dt) {
        const blend = 1 - Math.pow(0.001, dt * 4);
        this.x += (this.targetX - this.x) * blend;
        if (Math.abs(this.targetX - this.x) < 1) this.x = this.targetX;
    }

    draw(ctx) {
        if (this.game.assets.player.complete) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            if (this.side === 'right') ctx.scale(-1, 1);
            ctx.drawImage(this.game.assets.player, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class World {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.spawnTimer = 0;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
    }

    update(dt) {
        this.spawnTimer -= dt;
        // ... Spawn Logic
        if (this.spawnTimer <= 0) {
            this.spawnSequence();

            // Constant Distance Spacing Logic
            let spacing = 1.0;
            if (this.game.phase === 'TRIAL') spacing = 2.0;

            // User requested "distance between obstacles reduced" in Ice Phase -> lower spacing
            if (this.game.phase === 'ICE_HELL' || this.game.phase === 'ABYSS') spacing = 0.8;

            let speedRatio = this.game.currentSpeed / this.game.BASE_SPEED;
            if (speedRatio < 0.1) speedRatio = 0.1; // Safety

            this.spawnTimer = spacing / speedRatio;
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let ob = this.obstacles[i];
            ob.y += this.game.currentSpeed * dt * 100;

            if (ob.y > this.game.GAME_HEIGHT) {
                this.obstacles.splice(i, 1);
            } else if (this.checkCollision(this.game.ninja, ob)) {
                this.handleCollision(ob, i);
            }
        }
    }

    spawnSequence() {
        const time = this.game.timeSurvived;
        const width = this.game.GAME_WIDTH;
        const phase = this.game.phase;

        if (phase === 'ICE_HELL' || phase === 'ABYSS') {
            const r = Math.random();

            // STRICTLY Avoid unavoidable obstacles (no concurrent wall spawns, no overlaps)
            // Just single intense obstacles

            if (r < 0.3) this.spawnEnemy();
            else if (r < 0.7) this.spawnMiddleBlade(Math.random() * (width - 60) + 30);
            else this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');

            // NO double trouble logic here to prevent "unavoidable" traps

            if (Math.random() < 0.08) this.spawnPowerUp(Math.random() < 0.5 ? 'shield' : 'time');
            return;
        }

        if (time <= 7) {
            if (Math.random() < 0.6) this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');
        } else if (time <= 15) {
            if (Math.random() < 0.6) this.spawnMiddleBlade(width / 2);
            else this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');
        } else if (time <= 25) {
            this.spawnMiddleBlade(Math.random() * (width - 100) + 50);
        } else if (time <= 30) {
            Math.random() < 0.2 ? this.spawnEnemy() : this.spawnMiddleBlade(Math.random() * (width - 100) + 50);
            if (Math.random() < 0.05) this.spawnPowerUp('shield');
        } else {
            const r = Math.random();
            if (r < 0.25) this.spawnEnemy();
            else if (r < 0.7) this.spawnMiddleBlade(Math.random() * (width - 60) + 30);
            else this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');
            if (Math.random() < 0.08) this.spawnPowerUp(Math.random() < 0.5 ? 'shield' : 'time');
        }
    }

    spawnWallBlade(side) {
        this.obstacles.push({ type: 'blade', x: side === 'left' ? 0 : this.game.GAME_WIDTH - 46, y: -46, width: 46, height: 46 });
    }
    spawnMiddleBlade(x) {
        this.obstacles.push({ type: 'blade', x: x - 23, y: -46, width: 46, height: 46 });
    }
    spawnEnemy() {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        this.obstacles.push({ type: 'enemy', x: side === 'left' ? 0 : this.game.GAME_WIDTH - 65, y: -70, width: 65, height: 65, damage: true });
    }
    spawnPowerUp(kind) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const w = 40;
        this.obstacles.push({ type: 'powerup', kind: kind, x: side === 'left' ? 5 : this.game.GAME_WIDTH - 5 - w, y: -50, width: w, height: w });
    }

    checkCollision(ninja, ob) {
        if (!ninja) { console.error("checkCollision: ninja is undefined"); return false; }
        if (!ob) { console.error("checkCollision: ob is undefined"); return false; }
        try {
            return (ninja.x < ob.x + ob.width && ninja.x + ninja.width > ob.x &&
                ninja.y < ob.y + ob.height && ninja.y + ninja.height > ob.y);
        } catch (e) {
            console.error("Error in checkCollision:", e, ninja, ob);
            return false;
        }
    }

    handleCollision(ob, index) {
        if (ob.type === 'powerup') {
            if (ob.kind === 'shield') this.game.hasShield = true;
            else if (ob.kind === 'time') { this.game.timeSlowActive = true; this.game.timeSlowTimer = 5.0; }
            this.obstacles.splice(index, 1);
        } else {
            if (this.game.hasShield) {
                this.game.hasShield = false;
                this.obstacles.splice(index, 1);
            } else {
                this.game.endGame();
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, 0, 10, this.game.GAME_HEIGHT);
        ctx.fillRect(this.game.GAME_WIDTH - 10, 0, 10, this.game.GAME_HEIGHT);

        for (let ob of this.obstacles) {
            let img = null;
            if (ob.type === 'blade') img = this.game.assets.shuriken;
            else if (ob.type === 'enemy') img = this.game.assets.enemy;
            else if (ob.type === 'powerup') img = ob.kind === 'shield' ? this.game.assets.shield : this.game.assets.timeOrb;

            if (img && img.complete) ctx.drawImage(img, ob.x, ob.y, ob.width, ob.height);
            else {
                ctx.fillStyle = 'red';
                ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
            }
        }
    }
}

export class Game {
    constructor(canvasId, userId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.userId = userId;

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
            player: new Image()
        };
        this.assets.shield.src = 'assets/element_1.png';
        this.assets.timeOrb.src = 'assets/element_0.png';
        this.assets.shuriken.src = 'assets/element_4.png';
        this.assets.enemy.src = 'assets/element_3.png';
        this.assets.bg.src = 'assets/background_game.png';
        this.assets.player.src = 'assets/IMG_1226.PNG';

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

        this.hasShield = false;
        this.timeSlowActive = false;
        this.timeSlowTimer = 0;

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
        if (this.timeSlowActive) effectiveDt *= 0.5;

        this.timeSurvived += effectiveDt;
        this.distanceTravelled += this.currentSpeed * effectiveDt * 10;

        this.updateDifficulty(dt);
        this.ninja.update(effectiveDt);
        this.world.update(effectiveDt);

        if (this.world.checkCollision(this.ninja)) {
            // Collision Logic
        }
    }

    updateDifficulty(dt) {
        const t = this.timeSurvived;

        if (t <= 7) this.phase = 'TRIAL';
        else if (t <= 15) this.phase = 'INTRO';
        else if (t <= 25) this.phase = 'AXIS';
        else if (t <= 30) this.phase = 'THREAT';
        else if (t <= 50) this.phase = 'CORE';
        else this.phase = 'INTENSE';

        if (t > 20) {
            if (this.currentSpeed < this.MAX_SPEED) {
                let r = t > 40 ? 0.06 : 0.04;
                this.currentSpeed += r * dt;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background
        if (this.assets.bg.complete) {
            this.ctx.drawImage(this.assets.bg, 0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
            if (this.phase === 'INTENSE' || this.phase === 'DARK' || this.phase === 'HELL') {
                this.ctx.fillStyle = 'rgba(50, 0, 0, 0.3)';
                this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
            }
        } else {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        }

        this.world.draw(this.ctx);
        this.ninja.draw(this.ctx);

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Inter';
        this.ctx.fillText(`Dist: ${Math.floor(this.distanceTravelled)}m`, 20, 40);

        if (this.hasShield) this.ctx.drawImage(this.assets.shield, 20, 60, 40, 40);

        if (this.isGameOver) this.drawGameOver();
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        this.ctx.fillStyle = '#d4af37';
        this.ctx.textAlign = 'center';
        this.ctx.font = '40px Cinzel';
        this.ctx.fillText('DOOMED', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 20);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Inter';
        this.ctx.fillText(`Distance: ${Math.floor(this.distanceTravelled)}m`, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 30);
        this.ctx.fillText('Tap to Reincarnate', this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 70);
        this.ctx.textAlign = 'start';
    }

    endGame() {
        this.isRunning = false;
        this.isGameOver = true;
        this.draw();
    }
}

class Ninja {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
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

            let speedRatio = this.game.currentSpeed / this.game.BASE_SPEED;
            if (speedRatio < 0.1) speedRatio = 0.1; // Safety

            this.spawnTimer = spacing / speedRatio;
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let ob = this.obstacles[i];
            ob.y += this.game.currentSpeed * dt * 100;

            if (ob.y > this.game.GAME_HEIGHT) this.obstacles.splice(i, 1);
            if (this.checkCollision(this.game.ninja, ob)) this.handleCollision(ob, i);
        }
    }

    spawnSequence() {
        const time = this.game.timeSurvived;
        const width = this.game.GAME_WIDTH;

        if (time <= 7) {
            if (Math.random() < 0.6) this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');
        } else if (time <= 15) {
            if (Math.random() < 0.6) this.spawnMiddleBlade(width / 2);
            else this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');
        } else if (time <= 25) {
            this.spawnMiddleBlade(Math.random() * (width - 100) + 50);
        } else if (time <= 30) {
            Math.random() < 0.2 ? this.spawnEnemy() : this.spawnMiddleBlade(Math.random() * (width - 100) + 50);
            if (Math.random() < 0.05) this.spawnPowerUp(Math.random() < 0.5 ? 'shield' : 'time');
        } else {
            const r = Math.random();
            if (r < 0.25) this.spawnEnemy();
            else if (r < 0.7) this.spawnMiddleBlade(Math.random() * (width - 60) + 30);
            else this.spawnWallBlade(Math.random() < 0.5 ? 'left' : 'right');
            if (Math.random() < 0.03) this.spawnPowerUp(Math.random() < 0.5 ? 'shield' : 'time');
        }
    }

    spawnWallBlade(side) {
        this.obstacles.push({ type: 'blade', x: side === 'left' ? 0 : this.game.GAME_WIDTH - 40, y: -50, width: 40, height: 40 });
    }
    spawnMiddleBlade(x) {
        this.obstacles.push({ type: 'blade', x: x - 20, y: -50, width: 40, height: 40 });
    }
    spawnEnemy() {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        this.obstacles.push({ type: 'enemy', x: side === 'left' ? 0 : this.game.GAME_WIDTH - 50, y: -60, width: 50, height: 50, damage: true });
    }
    spawnPowerUp(kind) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const w = 30;
        this.obstacles.push({ type: 'powerup', kind: kind, x: side === 'left' ? 5 : this.game.GAME_WIDTH - 5 - w, y: -50, width: w, height: w });
    }

    checkCollision(ninja, ob) {
        return (ninja.x < ob.x + ob.width && ninja.x + ninja.width > ob.x &&
            ninja.y < ob.y + ob.height && ninja.y + ninja.height > ob.y);
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

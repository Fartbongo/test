const app = Vue.createApp({
    data() {
        return {
            gameLoaded: false,
            canvas: null,
            ctx: null,
            SCREEN_WIDTH: 480,
            SCREEN_HEIGHT: 400,
            GRID_SIZE: 40,
            player: {
                pos: { x: 1, y: 1 },
                health: 10,
                attack: 3
            },
            level: 1,
            enemies: [],
            walls: [],
            health_blocks: [],
            timer: 0,
            timerInterval: null,
            gameEnded: false,
            gameLoopId: null,
            goal_pos: { x: 10, y: 8 }
        }
    },
    mounted() {
        this.initGame();
        window.addEventListener('keydown', this.handleKeyPress);
        this.startTimer();
    },
    unmounted() {
        window.removeEventListener('keydown', this.handleKeyPress);
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        if (this.timerInterval) clearInterval(this.timerInterval);
    },
    methods: {
        initGame() {
            this.canvas = this.$refs.gameCanvas;
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                if (this.ctx) {
                    this.gameLoaded = true;
                    this.generateLevel();
                    this.gameLoop();
                }
            }
        },
        generateLevel() {
            // Generate walls first
            this.walls = [];
            for (let i = 0; i < 15; i++) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * 12);
                    y = Math.floor(Math.random() * 10);
                } while (
                    (x === this.player.pos.x && y === this.player.pos.y) ||
                    (x === this.goal_pos.x && y === this.goal_pos.y)
                );
                this.walls.push({ x, y });
            }

            // Calculate available spaces
            const availableSpaces = [];
            for (let x = 0; x < 12; x++) {
                for (let y = 0; y < 10; y++) {
                    if (!this.walls.some(wall => wall.x === x && wall.y === y) &&
                        !(x === this.player.pos.x && y === this.player.pos.y) &&
                        !(x === this.goal_pos.x && y === this.goal_pos.y)) {
                        availableSpaces.push({ x, y });
                    }
                }
            }

            // Shuffle available spaces
            for (let i = availableSpaces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableSpaces[i], availableSpaces[j]] = [availableSpaces[j], availableSpaces[i]];
            }

            // Calculate how many spaces to fill
            const totalSpaces = availableSpaces.length;
            
            // Enemy scaling remains the same
            const enemyCount = Math.min(
                Math.floor(totalSpaces * (this.level / 15)), 
                totalSpaces - 4  // Leave room for more health blocks
            );
            
            // More health blocks - scales with level but caps at 4
            const healthCount = Math.min(4, Math.max(2, Math.floor(this.level / 3)));

            // Generate enemies
            this.enemies = [];
            for (let i = 0; i < enemyCount && availableSpaces.length > 0; i++) {
                this.enemies.push(availableSpaces.pop());
            }

            // Generate health blocks
            this.health_blocks = [];
            for (let i = 0; i < healthCount && availableSpaces.length > 0; i++) {
                this.health_blocks.push(availableSpaces.pop());
            }
        },
        isColliding(x, y) {
            // Check walls
            if (this.walls.some(wall => wall.x === x && wall.y === y)) return true;
            // Check player
            if (this.player.pos.x === x && this.player.pos.y === y) return true;
            // Check enemies
            if (this.enemies.some(enemy => enemy.x === x && enemy.y === y)) return true;
            // Check health blocks
            if (this.health_blocks.some(block => block.x === x && block.y === y)) return true;
            // Check goal
            if (this.goal_pos.x === x && this.goal_pos.y === y) return true;
            return false;
        },
        gameLoop() {
            if (!this.gameEnded) {
                this.update();
                this.draw();
                this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
            }
        },
        update() {
            // Check for collisions with health blocks
            this.health_blocks = this.health_blocks.filter(block => {
                if (block.x === this.player.pos.x && block.y === this.player.pos.y) {
                    this.player.health += 5; // No maximum health cap
                    return false;
                }
                return true;
            });

            // Check for collisions with enemies
            this.enemies = this.enemies.filter(enemy => {
                if (enemy.x === this.player.pos.x && enemy.y === this.player.pos.y) {
                    this.player.health -= 2;
                    
                    // Check if player died
                    if (this.player.health <= 0) {
                        this.gameEnded = true;
                        const minutes = Math.floor(this.timer / 60);
                        const seconds = this.timer % 60;
                        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        alert(`Game Over!\nYou reached level ${this.level}\nTime survived: ${timeString}`);
                        
                        // Reset game
                        this.player.health = 10;
                        this.level = 1;
                        this.player.pos = { x: 1, y: 1 };
                        this.timer = 0;
                        this.generateLevel();
                        this.gameEnded = false;
                    }
                    return false; // Remove the enemy after combat
                }
                return true;
            });

            // Check if player reached goal
            if (this.player.pos.x === this.goal_pos.x && this.player.pos.y === this.goal_pos.y) {
                this.level++;
                this.player.pos = { x: 1, y: 1 };
                this.generateLevel();
            }
        },
        draw() {
            if (!this.ctx) return;

            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

            // Draw grid
            this.ctx.strokeStyle = '#333';
            for (let i = 0; i <= this.SCREEN_WIDTH; i += this.GRID_SIZE) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i, this.SCREEN_HEIGHT);
                this.ctx.stroke();
            }
            for (let i = 0; i <= this.SCREEN_HEIGHT; i += this.GRID_SIZE) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, i);
                this.ctx.lineTo(this.SCREEN_WIDTH, i);
                this.ctx.stroke();
            }

            // Draw walls
            this.ctx.fillStyle = '#666';
            this.walls.forEach(wall => {
                this.ctx.fillRect(
                    wall.x * this.GRID_SIZE,
                    wall.y * this.GRID_SIZE,
                    this.GRID_SIZE - 2,
                    this.GRID_SIZE - 2
                );
            });

            // Draw health blocks
            this.ctx.fillStyle = '#0f0';
            this.health_blocks.forEach(block => {
                this.ctx.fillRect(
                    block.x * this.GRID_SIZE + 10,
                    block.y * this.GRID_SIZE + 10,
                    this.GRID_SIZE - 20,
                    this.GRID_SIZE - 20
                );
            });

            // Draw enemies
            this.ctx.fillStyle = '#f00';
            this.enemies.forEach(enemy => {
                this.ctx.fillRect(
                    enemy.x * this.GRID_SIZE + 5,
                    enemy.y * this.GRID_SIZE + 5,
                    this.GRID_SIZE - 10,
                    this.GRID_SIZE - 10
                );
            });

            // Draw player
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(
                this.player.pos.x * this.GRID_SIZE + 5,
                this.player.pos.y * this.GRID_SIZE + 5,
                this.GRID_SIZE - 10,
                this.GRID_SIZE - 10
            );

            // Draw goal
            this.ctx.fillStyle = '#ff0';
            this.ctx.fillRect(
                this.goal_pos.x * this.GRID_SIZE + 5,
                this.goal_pos.y * this.GRID_SIZE + 5,
                this.GRID_SIZE - 10,
                this.GRID_SIZE - 10
            );
        },
        handleKeyPress(e) {
            if (this.gameEnded) return;

            const moves = {
                'ArrowUp': { x: 0, y: -1 },
                'ArrowDown': { x: 0, y: 1 },
                'ArrowLeft': { x: -1, y: 0 },
                'ArrowRight': { x: 1, y: 0 }
            };

            const move = moves[e.key];
            if (move) {
                e.preventDefault();
                this.movePlayer(move.x, move.y);
            }
        },
        handleMove(direction) {
            // This handles mobile button clicks
            const moves = {
                'ArrowUp': { x: 0, y: -1 },
                'ArrowDown': { x: 0, y: 1 },
                'ArrowLeft': { x: -1, y: 0 },
                'ArrowRight': { x: 1, y: 0 }
            };

            const move = moves[direction];
            if (move) {
                this.movePlayer(move.x, move.y);
            }
        },
        movePlayer(x, y) {
            const newX = this.player.pos.x + x;
            const newY = this.player.pos.y + y;

            // Check wall collisions
            if (!this.walls.some(wall => wall.x === newX && wall.y === newY)) {
                if (newX >= 0 && newX < 12 && newY >= 0 && newY < 10) {
                    this.player.pos.x = newX;
                    this.player.pos.y = newY;
                }
            }
        },
        startTimer() {
            this.timerInterval = setInterval(() => {
                this.timer++;
            }, 1000);
        }
    },
    template: `
        <div class="game-container">
            <canvas ref="gameCanvas" 
                    :width="SCREEN_WIDTH" 
                    :height="SCREEN_HEIGHT"
                    style="background: #000;">
            </canvas>
            <div class="game-stats">
                <p>Health: {{ player.health }}</p>
                <p>Level: {{ level }}</p>
                <p>Time: {{ timer }}s</p>
            </div>
            <div class="mobile-controls">
                <div class="control-row">
                    <button class="control-btn" @touchstart.prevent="handleMove('ArrowUp')" @mousedown.prevent="handleMove('ArrowUp')">↑</button>
                </div>
                <div class="control-row">
                    <button class="control-btn" @touchstart.prevent="handleMove('ArrowLeft')" @mousedown.prevent="handleMove('ArrowLeft')">←</button>
                    <button class="control-btn" @touchstart.prevent="handleMove('ArrowDown')" @mousedown.prevent="handleMove('ArrowDown')">↓</button>
                    <button class="control-btn" @touchstart.prevent="handleMove('ArrowRight')" @mousedown.prevent="handleMove('ArrowRight')">→</button>
                </div>
            </div>
        </div>
    `
});

app.mount('#app');
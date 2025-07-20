class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.pauseMessage = document.getElementById('pauseMessage');
        
        // 游戏设置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.snake = [{ x: 10, y: 10 }];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.init();
    }
    
    init() {
        this.updateHighScore();
        this.generateFood();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !this.gamePaused) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // 移动端控制按钮
        document.querySelectorAll('.control-btn[data-direction]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameRunning && !this.gamePaused) return;
                
                const direction = btn.dataset.direction;
                switch (direction) {
                    case 'up':
                        if (this.dy !== 1) {
                            this.dx = 0;
                            this.dy = -1;
                        }
                        break;
                    case 'down':
                        if (this.dy !== -1) {
                            this.dx = 0;
                            this.dy = 1;
                        }
                        break;
                    case 'left':
                        if (this.dx !== 1) {
                            this.dx = -1;
                            this.dy = 0;
                        }
                        break;
                    case 'right':
                        if (this.dx !== -1) {
                            this.dx = 1;
                            this.dy = 0;
                        }
                        break;
                }
            });
        });
        
        // 暂停按钮
        this.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
        
        // 重新开始按钮
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        // 点击画布开始游戏
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning && !this.gamePaused) {
                this.startGame();
            }
        });
    }
    
    startGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.updateScore();
        this.generateFood();
        this.gameOverElement.classList.add('hidden');
        this.pauseMessage.classList.add('hidden');
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.pauseMessage.classList.remove('hidden');
            this.pauseBtn.textContent = '▶';
        } else {
            this.pauseMessage.classList.add('hidden');
            this.pauseBtn.textContent = '⏸';
        }
    }
    
    restartGame() {
        this.startGame();
    }
    
    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
        
        this.food = foodPosition;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 移动蛇头
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // 检查撞墙
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查撞自己
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.ctx.fillStyle = '#0f0';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#0a0';
            } else {
                this.ctx.fillStyle = '#0f0';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 添加蛇头眼睛
            if (index === 0) {
                this.ctx.fillStyle = '#fff';
                const eyeSize = 3;
                const eyeOffset = 5;
                
                if (this.dx === 1) { // 向右
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset, segment.y * this.gridSize + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset, segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.dx === -1) { // 向左
                    this.ctx.fillRect(segment.x * this.gridSize + 2, segment.y * this.gridSize + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 2, segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.dy === 1) { // 向下
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset, segment.y * this.gridSize + this.gridSize - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize, segment.y * this.gridSize + this.gridSize - eyeOffset, eyeSize, eyeSize);
                } else if (this.dy === -1) { // 向上
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset, segment.y * this.gridSize + 2, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize, segment.y * this.gridSize + 2, eyeSize, eyeSize);
                }
            }
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 1,
            this.food.y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );
        
        // 添加食物光泽效果
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 3,
            this.food.y * this.gridSize + 3,
            this.gridSize / 3,
            this.gridSize / 3
        );
        
        // 如果游戏未开始，显示提示
        if (!this.gameRunning && !this.gamePaused) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击开始游戏', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('使用方向键或按钮控制', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.updateHighScore();
        }
    }
    
    updateHighScore() {
        this.highScoreElement.textContent = this.highScore;
        localStorage.setItem('snakeHighScore', this.highScore);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        // 根据分数调整游戏速度
        const speed = Math.max(100, 200 - Math.floor(this.score / 50) * 10);
        setTimeout(() => this.gameLoop(), speed);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
}); 
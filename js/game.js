var game = this.game || {};


(function(module){
    // =================================================================
    // VARIABLES
    // =================================================================

    // Constants
    var FRAME_RATE = 60;

    var STAGE_WIDTH = 1366;
    var STAGE_HEIGHT = 768;
    var STAGE_PADDING = 50;

    var PADDLE_WIDTH = 120;
    var PADDLE_HEIGHT = 20;
    var PADDLE_SPEED = STAGE_WIDTH / 4;

    var BALL_SIZE = 10;
    var BALL_SPEED = STAGE_HEIGHT / 3;

    var BLOCK_WIDTH = 100;
    var BLOCK_HEIGHT = 25;
    var BLOCK_PADDING = 5;

    // Game Objects
    var stage = {};
    var paddle = {};
    var ball = {};
    var blocks = [];

    // Key States
    var leftDown = false;
    var rightDown = false;
    

    // =================================================================
    // INITIALIZATION
    // =================================================================

    module.init = function() {
        stage = new createjs.Stage("js-canvas");
        initPaddle();
        initBall();
        initBlocks();
        initEvents();
    }

    function initPaddle() {
        paddle = new createjs.Shape();
        paddle.graphics.beginFill("white").drawRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        paddle.x = STAGE_WIDTH/2 - PADDLE_WIDTH/2;
        paddle.y = STAGE_HEIGHT - PADDLE_HEIGHT;
        stage.addChild(paddle);
    }

    function initBall() {
        ball = new createjs.Shape();
        ball.graphics.beginFill("white").drawRect(0, 0, BALL_SIZE * 2, BALL_SIZE * 2);
        ball.regX = BALL_SIZE;
        ball.regY = BALL_SIZE;
        ball.x = paddle.x + PADDLE_WIDTH/2;
        ball.y = paddle.y - BALL_SIZE;
        var theta = -(Math.random() * (Math.PI/2) + (Math.PI/4));
        ball.vx = Math.cos(theta) * BALL_SPEED;
        ball.vy = Math.sin(theta) * BALL_SPEED;
        stage.addChild(ball);
    }

    function initBlocks() {
        var numCols = Math.floor((STAGE_WIDTH - STAGE_PADDING * 2) / (BLOCK_WIDTH + BLOCK_PADDING));
        var numRows = Math.floor((STAGE_HEIGHT * (2/3) - STAGE_PADDING * 2) / (BLOCK_HEIGHT + BLOCK_PADDING));

        var leftMargin = (STAGE_WIDTH - (numCols * (BLOCK_WIDTH + BLOCK_PADDING))) / 2;
        console.log(leftMargin);
        console.log(numCols);
        for (var col = 0; col < numCols; col++) {
            var x = col * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING + leftMargin;

            for (var row = 0; row < numRows; row++) {
                var y = row * (BLOCK_HEIGHT + BLOCK_PADDING) + BLOCK_PADDING + STAGE_PADDING;
                drawBlock(x, y);
            }
        }
    }

    function initEvents() {
        window.onkeydown = keyDown;
        window.onkeyup = keyUp;
        createjs.Ticker.setFPS(FRAME_RATE);
        createjs.Ticker.addEventListener("tick", tick);
    }

    // =================================================================
    // EVENTS
    // =================================================================

    function keyDown(e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (key === 37 || key === 65)
            leftDown = true;
        else if (key === 39 || key === 68)
            rightDown = true;
    }

    function keyUp(e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (key === 37 || key === 65)
            leftDown = false;
        else if (key === 39 || key === 68)
            rightDown = false;
    }

    function tick(e) {
        // Convert the delta to seconds, which is much more useful
        var delta = e.delta/1000;

        moveBall(delta);
        movePaddle(delta);
        checkCollisions();
        stage.update();
    }

    // =================================================================
    // HELPERS
    // =================================================================

    function drawBlock(x, y) {
        var block = new createjs.Shape();
        block.graphics.beginFill("white").drawRect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);
        stage.addChild(block);
        blocks.push(block);
    }

    function moveBall(delta) {
        ball.x += delta * ball.vx;
        ball.y += delta * ball.vy;
    }

    function movePaddle(delta) {
        if (leftDown)
            paddle.x -= delta * PADDLE_SPEED;
        if (rightDown)
            paddle.x += delta * PADDLE_SPEED;
    }

    function checkCollisions() {
        // Check collision with paddle
        if (ball.y + BALL_SIZE > paddle.y) 
            bounceOffPaddle();

        // Check collisions with blocks
        for (var i = blocks.length - 1; i >= 0; i--) {
            checkCollisionWithBlock(blocks[i]);
        }
    }

    function checkCollisionWithBlock(block) {
        if (!isBallTouchingBlock(block))
            return;

        // If the ball is moving up
        if (ball.vy < 0) {
            // if (ball. y - BALL_SIZE < )
        }
    }

    function bounceOffPaddle() {
        ball.vy = ball.vy * -1;
    }

    function isBallTouchingBlock(block) {
        var tl = { x: ball.x - BALL_SIZE, y: ball.y - BALL_SIZE };
        var tr = { x: ball.x + BALL_SIZE, y: ball.y - BALL_SIZE };
        var bl = { x: ball.x - BALL_SIZE, y: ball.y + BALL_SIZE };
        var br = { x: ball.x + BALL_SIZE, y: ball.y + BALL_SIZE };

        if (block.hitTest(tl.x, tl.y))
            return true;
        else if (block.hitTest(tr.x, tr.y))
            return true;
        else if (block.hitTest(bl.x, bl.y))
            return true;
        else if (block.hitTest(br.x, br.y))
            return true;
    }

})(game);

window.onload = function() {
    game.init();    
}
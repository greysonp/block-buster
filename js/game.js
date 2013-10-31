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
    var PADDLE_HEIGHT = 30;
    var PADDLE_SPEED = STAGE_WIDTH / 4;

    var BLOCK_WIDTH = 100;
    var BLOCK_HEIGHT = 25;
    var BLOCK_PADDING = 5;

    // Game Objects
    var stage = {};
    var paddle = {};
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
        initBlocks();
        initEvents();
    }

    function initPaddle() {
        paddle = new createjs.Shape();
        paddle.graphics.beginFill("white").drawRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        paddle.x = STAGE_WIDTH/2 - PADDLE_WIDTH/2;
        paddle.y = STAGE_HEIGHT - PADDLE_HEIGHT;
        stage.addChild(paddle);
        stage.update();
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
        stage.update();
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
        movePaddle(e.delta);
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

    function movePaddle(delta) {
        var sec = delta/1000;
        if (leftDown)
            paddle.x -= sec * PADDLE_SPEED;
        if (rightDown)
            paddle.x += sec * PADDLE_SPEED;
    }

})(game);

window.onload = function() {
    game.init();    
}
function drawSquare(board, size, color, posX = 0, posY = 0) {
  const ctx = board.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(posX, posY, size, size);
}

const snakeDirection = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
};

class SnakeFragment {
  // posX;
  // posY;
  // size;
  // color;

  constructor(posX, posY, size = 28, color = 'blue') {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.color = color;
  }

  move(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }
}

class Snake {
  
  // body;
  // size;

  constructor(posX, posY, size) {
    this.direction = snakeDirection.RIGHT;
    this.size = size;

    const head = new SnakeFragment(posX, posY, size, 'green');
    this.body = [head];
  }

  getSegment(posX, posY) {
    return new SnakeFragment(posX, posY, this.size);
  }

  head() {
    const { body } = this;
    return body[0];
  }

  tail() {
    const { body } = this;
    return body[body.length -1];
  }

  addPoints(points) {
    while (points) {
      this.add();
      points --;
    }
  }

  add() {
    let segment;
    const tail = this.tail();
    switch(this.direction){
      case snakeDirection.UP: segment = this.getSegment(tail.posX, tail.posY + tail.size);
        break;
      case snakeDirection.DOWN: segment = this.getSegment(tail.posX, tail.posY - tail.size);
        break;
      case snakeDirection.LEFT: segment = this.getSegment(tail.posX + tail.size, tail.posY);
        break;
      case snakeDirection.RIGHT: segment = this.getSegment(tail.posX - tail.size, tail.posY);
        break;
    }

    this.body.push(segment);
    console.log(this.body);
  }

  move() {
    const head = this.head();
    const { body } = this;
    for(let i = body.length - 1 ; i > 0; i--) {
      const prev = body[i-1];
      const current = body[i];

      current.move(prev.posX, prev.posY);
    }

    switch(this.direction) {
      case snakeDirection.UP: head.posY = head.posY - this.size;
        break;
      case snakeDirection.DOWN: head.posY = head.posY + this.size;
        break;
      case snakeDirection.LEFT: head.posX = head.posX - this.size;
        break;
      case snakeDirection.RIGHT: head.posX = head.posX + this.size;
        break;
    }

    return { posX: head.posX, posY: head.posY };
  }

  setDirection(direction) {
    if (
      direction === snakeDirection.DOWN && this.direction != snakeDirection.UP ||
      direction === snakeDirection.UP && this.direction != snakeDirection.DOWN ||
      direction === snakeDirection.LEFT && this.direction != snakeDirection.RIGHT ||
      direction === snakeDirection.RIGHT && this.direction != snakeDirection.LEFT
      ) {
      this.direction = direction;
      this.head().direction = this.direction;
    }
  }

  isCrashed(element) {
    const head = element;
    const { body } = this;
    const isCrashed = body.some(segment => segment.color !== head.color
      && segment.posX === head.posX
      && segment.posY === head.posY);
    return isCrashed;
  }
}

class SnakeGame {

  // board;
  // snake;

  // width;
  // height;

  // initX;
  // initY;

  // maxX;
  // maxY;

  // size;

  // renderInterval;

  // reward;

  // counter;
  // actionButton;
  // message;

  // speed;

  constructor(boardId, size, width = 800, height = 800, speed = 100) {

    this.width = width;
    this.speed = speed;
    this.height = height;
    this.actionButton = document.getElementById('actionButton');
    this.actionButton.innerHTML = "Start";
    this.counter = document.getElementById('points');
    this.board = document.getElementById(boardId);
    this.message = document.getElementById("message");
    this.configureBoard(this.board);
    
    this.size = size;

    this.initX = 0;
    this.initY = 0;

    this.maxX = Math.floor(width / size);
    this.maxY = Math.floor(height / size);

    this.setSnake();

    window.addEventListener('keyup', ($event) => this.handleKeys($event));
    actionButton.addEventListener('click', ($event) => this.handleAction())
  }

  configureBoard(board) {
    board.width = this.width;
    board.height = this.height;
  }

  setSnake() {
    this.snake = new Snake(this.initX, this.initY, this.size);
  }

  start() {
    this.addReward();
    this.renderInterval = setInterval(this.render.bind(this), this.speed);
  }

  render() {
    this.clear(this.board);
    this.update();
  }

  clear(board) {
    const ctx = board.getContext('2d');
    ctx.clearRect(0, 0, board.width, board.height);
  }

  update() {
    const { snake, board, reward } = this;
    const { body } = snake;
    this.handleMotion(snake.move());
    body.forEach(segment => drawSquare(
        board,
        segment.size,
        segment.color,
        segment.posX,
        segment.posY));
    
    drawSquare(
      board,
      reward.size,
      reward.color,
      reward.posX,
      reward.posY
    );
  }

  addReward() {
    this.reward = this.createReward();
    while(this.snake.isCrashed(this.reward)) {
      this.reward = this.createReward();
    }
  }

  createReward() {
    const posX = this.size * Math.floor(Math.random() * this.maxX);
    const posY = this.size * Math.floor(Math.random() * this.maxY);
    const reward = new SnakeFragment(posX, posY, this.size, 'red');
    return reward;
  }

  handleAction() {
    this.message.innerHTML = "Game started";
    this.counter.innerHTML = `0`;
    if (this.renderInterval) {
      clearInterval(this.clearInterval);
    }
    this.setSnake();
    this.start();
  }

  handleKeys($event) {
    const { key } = $event;
    if (Object.keys(snakeDirection).some(direction => snakeDirection[direction] === key )){
      this.snake.setDirection(key);
    }
  }

  handleMotion(headMovement) {
    const { posX, posY } = headMovement;
    this.handleReward(posX, posY);
    this.handleFatality(posX, posY);
  }

  handleReward(posX, posY) {
    const { reward } = this;
    if (reward.posX === posX && reward.posY === posY) {
      this.addReward();
      const { snake } = this;
      if (snake.body.length < 9) {
        snake.addPoints(1);
      } else {
        snake.addPoints(2);
      }
      this.counter.innerHTML = `${this.snake.body.length - 1}`;
    }
  }

  handleFatality(posX, posY) {
    if ( this.isOutOfBoard(posX, posY) || this.snake.isCrashed(this.snake.head()) ) {
      clearInterval(this.renderInterval);
      this.message.innerHTML = "You die!!! please start again";
    }
  }

  isOutOfBoard(posX, posY) {
    return posX < 0 || posY < 0 
    || posX + this.size > this.width
    || posY + this.size > this.height
  }
}

const game = new SnakeGame('snakeBoard', 5, 200, 400, 50);
// Объявление необходимых глобальных переменных.
let width;
let height;
let fps;
let tileSize;
let canvas;
let ctx;
let snake;
let food;
let score;
let isPaused;
let interval;
let soundEffects = {
  score: new Audio("./assets/sounds/score.mp3"),
  gameOver: new Audio("./assets/sounds/game-over.mp3"),
};
// Загрузка окна браузера
window.addEventListener("load", function () {
  game();
});

// Добавление обработчика событий для нажатий клавиш.
window.addEventListener("keydown", function (evt) {
  if (evt.key === " ") {
    evt.preventDefault();
    isPaused = !isPaused;
    showPaused();
  } else if (evt.key === "ArrowUp") {
    evt.preventDefault();
    if (
      snake.velY != 1 &&
      snake.x >= 0 &&
      snake.x <= width &&
      snake.y >= 0 &&
      snake.y <= height
    )
      snake.dir(0, -1);
  } else if (evt.key === "ArrowDown") {
    evt.preventDefault();
    if (
      snake.velY != -1 &&
      snake.x >= 0 &&
      snake.x <= width &&
      snake.y >= 0 &&
      snake.y <= height
    )
      snake.dir(0, 1);
  } else if (evt.key === "ArrowLeft") {
    evt.preventDefault();
    if (
      snake.velX != 1 &&
      snake.x >= 0 &&
      snake.x <= width &&
      snake.y >= 0 &&
      snake.y <= height
    )
      snake.dir(-1, 0);
  } else if (evt.key === "ArrowRight") {
    evt.preventDefault();
    if (
      snake.velX != -1 &&
      snake.x >= 0 &&
      snake.x <= width &&
      snake.y >= 0 &&
      snake.y <= height
    )
      snake.dir(1, 0);
  }
});

// Определение случайного места появления на сетке.
function spawnLocation() {
  // Разбиение всего холста на сетку из плиток.
  let rows = width / tileSize;
  let cols = height / tileSize;

  let xPos, yPos;

  xPos = Math.floor(Math.random() * rows) * tileSize;
  yPos = Math.floor(Math.random() * cols) * tileSize;

  return { x: xPos, y: yPos };
}

// Показывает счет игрока.
function showScore() {
  ctx.textAlign = "center";
  ctx.font = "40px 'Changa'";
  ctx.fillStyle = "white";
  ctx.fillText("СЧЕТ: " + score, width - 120, 30);
}

// Показывает, приостановлена ли игра.
function showPaused() {
  ctx.textAlign = "center";
  ctx.font = "35px 'Changa'   `";
  ctx.fillStyle = "white";
  ctx.fillText("ПАУЗА", width / 2, height / 2);
}

// Обработка змейки как объекта.
class Snake {
  // Инициализация свойств объекта.
  constructor(pos, color) {
    this.x = pos.x;
    this.y = pos.y;
    this.tail = [
      { x: pos.x - tileSize, y: pos.y },
      { x: pos.x - tileSize * 2, y: pos.y },
    ];
    this.velX = 1;
    this.velY = 0;
    this.color = color;
    this.soundEffects = soundEffects;
  }

  // Рисование змейки на холсте.
  draw() {
    // Рисование головы змейки.
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, tileSize, tileSize, 7);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();

    // Рисование хвоста змейки.
    for (var i = 0; i < this.tail.length; i++) {
      ctx.beginPath();
      ctx.roundRect(this.tail[i].x, this.tail[i].y, tileSize, tileSize, 5);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "sky";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.closePath();
    }
  }

  // Перемещение змейки путем обновления позиции.
  move() {
    // Перемещение хвоста.
    for (var i = this.tail.length - 1; i > 0; i--) {
      this.tail[i] = this.tail[i - 1];
    }

    // Обновление начала хвоста для получения позиции головы.
    if (this.tail.length != 0) this.tail[0] = { x: this.x, y: this.y };

    // Перемещение головы.
    this.x += this.velX * tileSize;
    this.y += this.velY * tileSize;
  }

  // Изменение направления движения змейки.
  dir(dirX, dirY) {
    this.velX = dirX;
    this.velY = dirY;
  }

  // Определение, съела ли змейка кусок еды.
  eat() {
    if (
      Math.abs(this.x - food.x) < tileSize &&
      Math.abs(this.y - food.y) < tileSize
    ) {
      // Добавление к хвосту.
      this.tail.push({});
      soundEffects.score.play();
      return true;
    }

    return false;
  }

  // Проверка, умерла ли змейка.
  die() {
    for (var i = 0; i < this.tail.length; i++) {
      if (
        Math.abs(this.x - this.tail[i].x) < tileSize &&
        Math.abs(this.y - this.tail[i].y) < tileSize
      ) {
        return true;
      }
    }

    return false;
  }

  border() {
    if (
      (this.x + tileSize > width && this.velX != -1) ||
      (this.x < 0 && this.velX != 1)
    )
      this.x = width - this.x;
    else if (
      (this.y + tileSize > height && this.velY != -1) ||
      (this.velY != 1 && this.y < 0)
    )
      this.y = height - this.y;
  }
}

// Обработка еды как объекта.
class Food {
  // Инициализация свойств объекта.
  constructor(pos, color) {
    this.x = pos.x;
    this.y = pos.y;
    this.color = color;
  }

  // Рисование еды на холсте.
  draw() {
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, tileSize, tileSize, 10);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
}

// Инициализация игровых объектов.
function init() {
  tileSize = 20;

  // Динамическое управление размером холста.
  width = tileSize * Math.floor(window.innerWidth / tileSize);
  height = tileSize * Math.floor(window.innerHeight / tileSize);

  fps = 10;

  canvas = document.getElementById("game-area");
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext("2d");

  isPaused = false;
  score = 0;
  snake = new Snake(
    {
      x: tileSize * Math.floor(width / (2 * tileSize)),
      y: tileSize * Math.floor(height / (2 * tileSize)),
    },
    "#088cc9"
  );
  food = new Food(spawnLocation(), "red");
}

// Обновление позиции и перерисовка игровых объектов.
function update() {
  // Проверка, приостановлена ли игра.
  if (isPaused) {
    return;
  }

  if (snake.die()) {
    Swal.fire({
      title: "Игра окончена!",
      background: "black",
      color: "green",
      width: "50%",
      height: "50%",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });

    soundEffects.gameOver.play();
    clearInterval(interval);
    setTimeout(() => {
      window.location.reload();
    }, "6000");
  }

  snake.border();

  if (snake.eat()) {
    score += 10;
    food = new Food(spawnLocation(), "red");
  }
  // Очистка холста для перерисовки.
  ctx.clearRect(0, 0, width, height);

  food.draw();
  snake.draw();
  snake.move();
  showScore();
}

// Фактическая функция игры.
function game() {
  init();

  interval = setInterval(update, 1000 / fps);
}

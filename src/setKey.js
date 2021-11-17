import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setKey(gameContainer, sounds) {
  const key = new AnimatedSprite([resources.key.texture]);
  key.velocity = 0.2;
  key.direction = 1;
  key.vx = 4;
  key.vy = 4;
  key.start = { x: 555, y: 150 };
  key.end = { x: 555, y: 155 };
  key.position.set(key.start.x, key.start.y);

  key.float = function () {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
    } else if (this.direction === -1) {
      progressX = this.position.x - this.start.x;
      progressY = this.position.y - this.start.y;
      goal = { x: this.start.x, y: this.start.y };
    }

    if (progressX !== 0)
      this.position.x =
        progressX <= this.velocity
          ? goal.x
          : this.position.x + this.velocity * this.direction;

    if (progressY !== 0)
      this.position.y =
        progressY <= this.velocity
          ? goal.y
          : this.position.y + this.velocity * this.direction;

    if (progressX === 0 && progressY === 0) {
      this.direction = -this.direction;
    }
  };

  key.collected = function () {
    sounds.play("key");
    this.textures =
      resources.fruit_collected.spritesheet.animations.fruit_collected;
    this.loop = false;

    this.play();
    this.onComplete = function () {
      gameContainer.removeChild(this);
      this.destroy();
    };
  };

  gameContainer.addChild(key);
  return key;
}

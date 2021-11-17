import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setPlatform(gameContainer) {
  const platform = new AnimatedSprite(
    resources.platform_on.spritesheet.animations.platform_on
  );
  platform.animationSpeed = 0.3;
  platform.velocity = 2;
  platform.direction = 1;
  platform.vx = 4;
  platform.vy = 4;
  platform.start = { x: 220, y: 80 };
  platform.end = { x: 490, y: 80 };

  platform.position.set(platform.start.x, platform.start.y);
  platform.play();

  platform.routine = function () {
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
  gameContainer.addChild(platform);
  return platform;
}

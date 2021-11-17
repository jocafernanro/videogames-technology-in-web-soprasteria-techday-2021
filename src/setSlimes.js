import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setSlimes(gameContainer, slimes) {
  const slimesConfig = [
    {
      velocity: 0.5,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 200, y: 178 },
      end: { x: 300, y: 178 },
      animationSpeed: 0.1,
    },
    {
      velocity: 1,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 350, y: 178 },
      end: { x: 500, y: 178 },
      animationSpeed: 0.3,
    },
  ];

  slimesConfig.forEach((slimeConfig) => {
    const slime = new AnimatedSprite(
      resources.slime_idle_run.spritesheet.animations.slime_idle_run
    );
    slime.velocity = slimeConfig.velocity;
    slime.direction = slimeConfig.direction;
    slime.vx = slimeConfig.vx;
    slime.vy = slimeConfig.vy;
    slime.start = slimeConfig.start;
    slime.end = slimeConfig.end;
    slime.position.set(slimeConfig.start.x, slimeConfig.start.y);
    slime.animationSpeed = slimeConfig.animationSpeed;
    slime.play();

    slime.routine = function () {
      let progressX;
      let progressY;
      let goal;

      if (this.direction === 1) {
        progressX = this.end.x - this.position.x;
        progressY = this.end.y - this.position.y;
        goal = { x: this.end.x, y: this.end.y };
        this.scale.x = -1;
        this.anchor.x = 1;
      } else if (this.direction === -1) {
        progressX = this.position.x - this.start.x;
        progressY = this.position.y - this.start.y;
        goal = { x: this.start.x, y: this.start.y };
        this.scale.x = 1;
        this.anchor.x = 0;
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
    gameContainer.addChild(slime);
    slimes.push(slime);
  });
}

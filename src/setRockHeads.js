import { AnimatedSprite, Loader } from "pixi.js";
import { shake } from "./utils";

const { resources } = Loader.shared;

export default function setRockHeads(gameContainer, rockHeads) {
  const rockHead = new AnimatedSprite([resources.rock_head_idle.texture]);
  const rockHeadHit = ({ animation } = {}) => {
    rockHead.textures = animation;
    rockHead.play();
    rockHead.loop = false;
    rockHead.onComplete = () => {
      rockHead.textures = [resources.rock_head_idle.texture];
    };
  };
  rockHead.position.set(50, 27 + 100);
  rockHead.velocity = 4;
  rockHead.direction = 1;
  rockHead.vx = 4;
  rockHead.vy = 4;
  rockHead.start = { x: 50, y: 60 };
  rockHead.end = { x: 50, y: 283 };
  rockHead.animationSpeed = 0.3;
  rockHead.play();
  rockHead.topHit = function () {
    rockHeadHit({
      animation:
        resources.rock_head_top_hit.spritesheet.animations.rock_head_top_hit,
    });
  };
  rockHead.bottomHit = function () {
    rockHeadHit({
      animation:
        resources.rock_head_bottom_hit.spritesheet.animations
          .rock_head_bottom_hit,
    });
    shake(gameContainer, 100);
  };

  rockHead.routine = function () {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
      if (progressY === 0) this.bottomHit();
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
  setInterval(() => {
    rockHead.textures =
      resources.rock_head_blink.spritesheet.animations.rock_head_blink;
    rockHead.play();
  }, 1000);

  rockHeads.push(rockHead);
  gameContainer.addChild(rockHead);
}

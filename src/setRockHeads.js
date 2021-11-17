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

  setInterval(() => {
    rockHead.textures =
      resources.rock_head_blink.spritesheet.animations.rock_head_blink;
    rockHead.play();
  }, 1000);

  rockHeads.push(rockHead);
  gameContainer.addChild(rockHead);
}

import { AnimatedSprite, Loader } from "pixi.js";
import { shake } from "./utils";

const { resources } = Loader.shared;

export default function setBoxes(gameContainer, boxes, sounds) {
  const boxesConfig = [
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 160, y: 149 },
      end: { x: 160, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 180, y: 149 },
      end: { x: 180, y: 151 },
    },
    {
      nHits: 4,
      velocity: 0.05,
      direction: 1,
      start: { x: 250, y: 149 },
      end: { x: 250, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 270, y: 149 },
      end: { x: 270, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 290, y: 149 },
      end: { x: 290, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 310, y: 149 },
      end: { x: 310, y: 151 },
    },
    {
      nHits: 6,
      velocity: 0.05,
      direction: 1,
      start: { x: 300, y: 259 },
      end: { x: 300, y: 261 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 320, y: 259 },
      end: { x: 320, y: 261 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 340, y: 259 },
      end: { x: 340, y: 261 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 400, y: 149 },
      end: { x: 400, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      start: { x: 420, y: 149 },
      end: { x: 420, y: 151 },
    },
    {
      nHits: 3,
      velocity: 0.05,
      direction: 1,
      start: { x: 440, y: 149 },
      end: { x: 440, y: 151 },
    },
    {
      nHits: 3,
      velocity: 0.05,
      direction: 1,
      start: { x: 460, y: 149 },
      end: { x: 460, y: 151 },
    },
  ];

  boxesConfig.forEach((boxConfig) => {
    const box = new AnimatedSprite([resources.box_idle.texture]);
    box.velocity = boxConfig.velocity;
    box.direction = boxConfig.direction;
    box.vx = boxConfig.vx;
    box.vy = boxConfig.vy;
    box.start = boxConfig.start;
    box.end = boxConfig.end;
    box.position.set(boxConfig.start.x, boxConfig.start.y);
    box.animationSpeed = 0.3;
    box.play();

    const fruitWon = new AnimatedSprite(
      resources.banana.spritesheet.animations.banana
    );
    fruitWon.play();
    fruitWon.position.set(-3, -3);
    fruitWon.alpha = 0;
    box.addChild(fruitWon);

    box.hit = function () {
      shake(gameContainer, 100);
      sounds.play("box_hit");
      this.nHitsDone = this.nHitsDone || 0;
      this.textures = resources.box_hit.spritesheet.animations.box_hit;
      this.play();
      this.loop = false;
      fruitWon.alpha = 1;

      this.onComplete = () => {
        sounds.play("box_hit_reward");
        fruitWon.alpha = 0;
        this.nHitsDone += 1;
        box.textures = [resources.box_idle.texture];
        if (this.nHitsDone === boxConfig.nHits) {
          boxes.splice(boxes.indexOf(box), 1);
          gameContainer.removeChild(this);
          this.destroy();
        }
      };
    };

    gameContainer.addChild(box);
    boxes.push(box);
  });
}

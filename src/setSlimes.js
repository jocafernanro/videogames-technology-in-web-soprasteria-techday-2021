import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setSlimes(gameContainer, slimes) {
  const slimesConfig = [
    {
      velocity: 0.5,
      direction: 1,
      start: { x: 200, y: 178 },
      end: { x: 300, y: 178 },
      animationSpeed: 0.1,
    },
    {
      velocity: 1,
      direction: 1,
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
    slime.start = slimeConfig.start;
    slime.end = slimeConfig.end;
    slime.position.set(slimeConfig.start.x, slimeConfig.start.y);
    slime.animationSpeed = slimeConfig.animationSpeed;
    slime.play();
    gameContainer.addChild(slime);
    slimes.push(slime);
  });
}

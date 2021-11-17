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

  gameContainer.addChild(platform);
  return platform;
}

import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setStartPoint(gameContainer) {
  const startPoint = new AnimatedSprite(
    resources.start.spritesheet.animations.start
  );
  startPoint.position.set(485, 240);
  startPoint.animationSpeed = 0.3;
  startPoint.play();
  gameContainer.addChild(startPoint);
}

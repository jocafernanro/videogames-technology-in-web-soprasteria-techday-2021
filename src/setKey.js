import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setKey(gameContainer, sounds) {
  const key = new AnimatedSprite([resources.key.texture]);
  key.velocity = 0.2;
  key.direction = 1;
  key.start = { x: 555, y: 150 };
  key.end = { x: 555, y: 155 };
  key.position.set(key.start.x, key.start.y);

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

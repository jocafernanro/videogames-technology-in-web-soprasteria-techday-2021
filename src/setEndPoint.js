/* eslint-disable no-param-reassign */
import { AnimatedSprite, Loader, Container, Sprite } from "pixi.js";

const { resources } = Loader.shared;

export default function setEndPoint(gameContainer, collisionsMap, sounds) {
  const endPoint = new AnimatedSprite([resources.end_idle.texture]);
  endPoint.position.set(530, 41);
  endPoint.animationSpeed = 0.3;
  endPoint.scale.set(0.7);
  endPoint.pressed = false;
  endPoint.play();
  gameContainer.addChild(endPoint);

  const barrierContainer = new Container();
  barrierContainer.position.set(512, 32);
  barrierContainer.scale.set(1);
  gameContainer.addChild(barrierContainer);

  const barrier = new Sprite(resources.terrain.textures.metal_brick_v_1);
  barrierContainer.addChild(barrier);

  const barrier2 = new Sprite(resources.terrain.textures.metal_brick_v_2);
  barrier2.position.set(0, barrier.y + barrier.height, 32);
  barrierContainer.addChild(barrier2);

  const barrier3 = new Sprite(resources.terrain.textures.metal_brick_v_2);
  barrier3.position.set(0, barrier2.y + barrier2.height, 32);
  barrierContainer.addChild(barrier3);

  const barrier4 = new Sprite(resources.terrain.textures.metal_brick_v_2);
  barrier4.position.set(0, barrier3.y + barrier3.height, 32);
  barrierContainer.addChild(barrier4);

  const barrier5 = new Sprite(resources.terrain.textures.metal_brick_v_3);
  barrier5.position.set(0, barrier4.y + barrier4.height, 32);
  barrierContainer.addChild(barrier5);

  endPoint.unlock = () => {
    collisionsMap.unlockEnd();
    const barrierItems = barrierContainer.children.map(
      (barrierItem) => barrierItem
    );
    barrierItems.forEach((barrierItem, index) => {
      setTimeout(() => {
        sounds.play("unlock_barrier");
        barrierContainer.removeChild(barrierItem);
      }, 500 + index * 300);
    });
  };

  endPoint.finish = function () {
    sounds.play("end");
    endPoint.pressed = true;
    this.textures = resources.end_pressed.spritesheet.animations.end_pressed;
    this.play();
  };

  endPoint.onComplete = () => {};

  return endPoint;
}

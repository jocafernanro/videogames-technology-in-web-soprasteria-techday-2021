import { AnimatedSprite, Loader, Container } from "pixi.js";

import { shake } from "./utils";

const { resources } = Loader.shared;

export default function setPlayer(gameContainer, sounds) {
  const player = new AnimatedSprite(
    resources.player_appearing.spritesheet.animations.player_appearing
  );
  player.appearing = true;
  player.loop = false;
  player.vx = 0;
  player.vy = 0;
  player.healthPoints = 4;
  player.fruits = 0;
  player.hasKey = false;
  player.invulnerable = false;
  player.dead = false;
  player.decreaseHealthPoints = function (lastCheckpoint) {
    if (!this.invulnerable) {
      sounds.play("player_hit");
      shake(gameContainer, 500);
      player.textures = resources.player_hit.spritesheet.animations.player_hit;
      player.loop = false;
      player.play();
      this.healthPoints--;
      this.invulnerable = true;

      setTimeout(() => {
        sounds.play("appearing");
        this.position.set(lastCheckpoint.position.x, lastCheckpoint.position.y);
        this.invulnerable = false;
        this.alpha = 1;
      }, 3000);
    }

    if (this.healthPoints === 0) {
      this.dead = true;
    }
  };
  player.incrementHealthPoints = function () {
    if (this.healthPoints < 4) {
      this.healthPoints++;
    }
  };
  player.incrementFruits = function () {
    this.fruits++;
  };
  player.position.set(480, 220);
  player.animationSpeed = 0.2;
  player.scale.x = -1;
  player.anchor.x = 1;
  player.hasCollidedWith = function (object) {
    return (
      this.x < object.position.x + object.width &&
      this.x + this.width > object.position.x &&
      this.y < object.y + object.height &&
      this.height + this.y > object.y
    );
  };
  player.play();
  player.onComplete = function () {
    if (this.appearing) this.position.set(510, 250);
    if (this.invulnerable) this.alpha = 0;
    this.appearing = false;
    this.loop = true;
    this.animationSpeed = 0.3;
  };
  gameContainer.addChild(player);
  return player;
}

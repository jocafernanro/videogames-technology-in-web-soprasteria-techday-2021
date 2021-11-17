/* eslint-disable no-param-reassign */
import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setCheckpoints(gameContainer, checkpoints, sounds) {
  const checkpointsConfiguration = [
    {
      x: 95,
      y: 240,
    },
    {
      x: 150,
      y: 16,
    },
  ];

  checkpointsConfiguration.forEach((checkpointConfiguration) => {
    const checkpoint = new AnimatedSprite([
      resources.checkpoint_noflag.texture,
    ]);
    checkpoint.achieved = false;
    checkpoint.position.set(
      checkpointConfiguration.x,
      checkpointConfiguration.y
    );
    checkpoint.animationSpeed = 0.3;
    checkpoint.play();
    checkpoint.achieved = () => {
      sounds.play("checkpoint_unlocked");
      checkpoint.completed = true;
      checkpoint.textures = resources.flag_out.spritesheet.animations.flag_out;
      checkpoint.loop = false;
      checkpoint.play();
      checkpoint.onComplete = () => {
        checkpoint.textures =
          resources.flag_idle.spritesheet.animations.flag_idle;
        checkpoint.loop = true;
        checkpoint.play();
      };
    };

    checkpoints.push(checkpoint);
    gameContainer.addChild(checkpoint);
  });
}

/* eslint-disable no-param-reassign */
import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setCheckpoints(gameContainer, checkpoints, sounds) {
  const openPopupLearningEvent = new Event("openPopupLearning");
  const openPopupWorkEvent = new Event("openPopupWork");
  const popupLearning = document.querySelector("#popup-learning");
  const popupWork = document.querySelector("#popup-work");

  const checkpointsConfiguration = [
    {
      x: 95,
      y: 240,
      popup: popupLearning,
      event: openPopupLearningEvent,
    },
    {
      x: 150,
      y: 16,
      popup: popupWork,
      event: openPopupWorkEvent,
    },
  ];

  checkpointsConfiguration.forEach((checkpointConfiguration) => {
    const checkpoint = new AnimatedSprite([
      resources.checkpoint_noflag.texture,
    ]);

    checkpoint.position.set(
      checkpointConfiguration.x,
      checkpointConfiguration.y
    );

    checkpoint.animationSpeed = 0.3;
    checkpoint.play();

    checkpoint.achieved = () => {
      console.log(checkpointConfiguration.popup);
      console.log(checkpointConfiguration.event);
      checkpointConfiguration.popup.dispatchEvent(
        checkpointConfiguration.event
      );
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
        console.log(checkpoint);
      };
    };

    checkpoints.push(checkpoint);
    gameContainer.addChild(checkpoint);
  });
}

import { AnimatedSprite, Sprite, Loader, Container } from "pixi.js";
import { AdjustmentFilter } from "@pixi/filter-adjustment";

import { textToSprite } from "./utils";

const { resources } = Loader.shared;

export default function setUI(UIContainer, player, sounds, bgSounds) {
  const topBar = new Container();
  topBar.position.set(24, 5);
  topBar.height = 15;
  topBar.hearts = [];
  UIContainer.addChild(topBar);

  const healthIndicator = new Container();
  healthIndicator.position.set(0, 0);
  topBar.addChild(healthIndicator);

  const healthTextContainer = new Container();
  healthIndicator.addChild(healthTextContainer);
  textToSprite({
    text: "health:",
    container: healthTextContainer,
    type: "white",
    scale: 0.5,
    separation: 4,
    y: 5,
  });

  for (let i = 0; i < player.healthPoints; i++) {
    const heart = new AnimatedSprite(
      resources.heart_idle.spritesheet.animations.heart_idle
    );
    heart.animationSpeed = 0.15;
    heart.position.set(30 + i * 10, 2);
    heart.scale.set(0.8);
    heart.play();
    healthIndicator.addChild(heart);
    topBar.hearts.push(heart);
  }

  const fruitsIndicator = new Container();
  topBar.addChild(fruitsIndicator);

  const fruitsTextContainer = new Container();
  fruitsTextContainer.position.set(healthIndicator.width + 10, 5);
  fruitsIndicator.addChild(fruitsTextContainer);
  textToSprite({
    text: "fruits:",
    container: fruitsTextContainer,
    type: "white",
    scale: 0.5,
    separation: 4,
  });

  const fruitSprite = new AnimatedSprite(
    resources.banana.spritesheet.animations.banana
  );
  fruitSprite.animationSpeed = 0.15;
  fruitSprite.position.set(115, -3);
  fruitSprite.scale.set(0.65);
  fruitSprite.play();
  fruitsIndicator.addChild(fruitSprite);

  const fruitsCounterTextContainer = new Container();
  fruitsCounterTextContainer.position.set(
    fruitSprite.position.x + fruitSprite.width,
    4
  );
  fruitsIndicator.addChild(fruitsCounterTextContainer);
  textToSprite({
    text: "0",
    container: fruitsCounterTextContainer,
    type: "white",
    scale: 0.7,
    separation: 10,
  });

  const keysIndicator = new Container();
  keysIndicator.position.set(
    fruitsCounterTextContainer.x + fruitsCounterTextContainer.width + 10,
    0
  );
  topBar.addChild(keysIndicator);

  const keysText = new Container();
  keysText.position.set(0, 5);
  keysIndicator.addChild(keysText);
  textToSprite({
    text: "keys:",
    container: keysText,
    type: "white",
    scale: 0.5,
    separation: 4,
  });

  const keySprite = new Sprite(resources.key.texture);
  keySprite.position.set(keysText.y + keysText.width, 2);
  keySprite.scale.set(0.65);
  keysIndicator.addChild(keySprite);

  const keysCounterTextContainer = new Container();
  keysCounterTextContainer.position.set(
    keySprite.position.x + keySprite.width + 2,
    4
  );
  keysIndicator.addChild(keysCounterTextContainer);
  textToSprite({
    text: "0",
    container: keysCounterTextContainer,
    type: "white",
    scale: 0.7,
    separation: 4,
  });

  const settingsBar = new Container();
  settingsBar.position.set(568, 5);
  settingsBar.height = 15;
  UIContainer.addChild(settingsBar);

  const volumeButton = new Sprite(resources.volume_button.texture);
  const offFilter = new AdjustmentFilter({
    brightness: 0.3,
  });
  volumeButton.volumeOn = true;
  volumeButton.scale.set(0.5);
  volumeButton.position.set(0, 3);
  volumeButton.interactive = true;
  volumeButton.buttonMode = true;
  volumeButton.on("pointerdown", () => {
    volumeButton.volumeOn = !volumeButton.volumeOn;
    if (volumeButton.volumeOn) {
      sounds.volume(1);
      bgSounds.volume(1);
      volumeButton.filters = [];
    } else {
      sounds.volume(0);
      bgSounds.volume(0);
      volumeButton.filters = [offFilter];
    }
  });
  settingsBar.addChild(volumeButton);

  const restartButton = new Sprite(resources.restart_button.texture);
  restartButton.scale.set(0.5);
  restartButton.position.set(volumeButton.x + volumeButton.width, 3);
  restartButton.interactive = true;
  restartButton.buttonMode = true;
  restartButton.on("pointerdown", () => {
    window.location.reload();
  });
  settingsBar.addChild(restartButton);

  topBar.decreaseHealthPoints = function (playerHealthPoints) {
    const heart = this.hearts[playerHealthPoints];
    if (heart.textures === resources.heart_hit.spritesheet.animations.heart_hit)
      return;

    heart.textures = resources.heart_hit.spritesheet.animations.heart_hit;
    heart.loop = false;
    heart.play();
  };

  topBar.increaseHealthPoints = function (playerHealthPoints) {
    const heart = this.hearts[playerHealthPoints];
    if (
      heart.textures === resources.heart_idle.spritesheet.animations.heart_idle
    )
      return;
    heart.textures = resources.heart_idle.spritesheet.animations.heart_idle;
    heart.loop = true;
    heart.play();
  };

  topBar.setFruits = (playerFruits) => {
    const textSprites = fruitsCounterTextContainer.children.map(
      (child) => child
    );

    textSprites.forEach((text) => {
      fruitsCounterTextContainer.removeChild(text);
    });

    textToSprite({
      text: `${playerFruits}`,
      container: fruitsCounterTextContainer,
      type: "white",
      scale: 0.7,
      separation: 5,
    });
  };

  topBar.setKeys = () => {
    const textSprites = keysCounterTextContainer.children.map((child) => child);

    textSprites.forEach((text) => {
      keysCounterTextContainer.removeChild(text);
    });

    textToSprite({
      text: `1`,
      container: keysCounterTextContainer,
      type: "white",
      scale: 0.7,
      separation: 4,
    });
  };

  return topBar;
}

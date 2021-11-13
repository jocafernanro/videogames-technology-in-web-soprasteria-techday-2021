/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
import "./assets/styles/style.css";
import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { check } from "prettier";

window.PIXI = PIXI; // remove when finished

const { Application } = PIXI;
const { Container } = PIXI;
const loader = PIXI.Loader.shared;
const { resources } = PIXI.Loader.shared;
const { Graphics } = PIXI;
// const { TextureCache } = PIXI.utils;
const { Sprite } = PIXI;
// const { Text } = PIXI;
// const { TextStyle } = PIXI;

const resolutionRatio = 1.7777777777777777;
const width = 1280;
const height = Math.round(width / resolutionRatio);
const tileSize = 16;

let player;
let backgroundTilemap;
let collisionsMap;
let touchingGround = false;
let healthBar;
const checkpoints = [];
const apples = [];
const rockHeads = [];

const app = new Application({
  backgroundColor: 0x211f30,
  width,
  height,
  roundPixels: true,
  antialias: true,
  transparent: false,
  resolution: 1,
});

const gameContainer = new Container();
gameContainer.width = width;
gameContainer.height = height;
gameContainer.x = 0;
gameContainer.y = 0;
app.stage.addChild(gameContainer);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

app.stage.scale.set(2);

// app.renderer.view.style.position = "absolute";
// app.renderer.view.style.display = "block";
// app.renderer.autoDensity = true;
// app.resizeTo = window;

document.querySelector("#main-container").appendChild(app.view);

class Keyboard {
  constructor() {
    this.pressed = {};
  }

  watch(el) {
    el.addEventListener("keydown", (e) => {
      this.pressed[e.key] = true;
    });
    el.addEventListener("keyup", (e) => {
      this.pressed[e.key] = false;
    });
  }
}

const kb = new Keyboard();
kb.watch(document.body);

function testCollision(worldX, worldY) {
  const mapX = Math.floor(worldX / tileSize);
  const mapY = Math.floor(worldY / tileSize);
  return collisionsMap[mapY][mapX];
}

// function that check if there is a collision between two objects
function checkCollision(object1, object2) {
  // get the position of the object
  // get the position of the object
  const object1X = object1.position.x;
  const object1Y = object1.position.y;
  const object2X = object2.position.x;
  const object2Y = object2.position.y;

  // get the size of the objects
  const object1Width = object1.width - 4;
  const object1Height = object1.height - 4;
  const object2Width = object2.width - 4;
  const object2Height = object2.height - 4;

  // check if the objects are colliding
  if (
    object1X < object2X + object2Width &&
    object1X + object1Width > object2X &&
    object1Y < object2Y + object2Height &&
    object1Height + object1Y > object2Y
  ) {
    return true;
  }
  return false;
}

// function that check laterally collisions between the player and the objects
function checkLateralCollision(object) {
  // get the position of the player
  const playerX = player.position.x;
  const playerY = player.position.y;

  // get the size of the player
  const playerWidth = player.width - 4;
  const playerHeight = player.height - 4;

  // get the size of the object
  const objectWidth = object.width - 4;
  const objectHeight = object.height - 4;

  // get the position of the object
  const objectX = object.position.x;
  const objectY = object.position.y;

  // check if the player is in the right or left of the object
  if (objectX < playerX + playerWidth && objectX + objectWidth > playerX) {
    // check if the player is in the top or bottom of the object
    if (objectY < playerY + playerHeight && objectY + objectHeight > playerY) {
      return true;
    }
  }
  return false;
}

// function that checks upper collisions between the player and the objects
function checkCollisionOnTop(object) {
  // get the position of the player
  const playerX = player.position.x;
  const playerY = player.position.y;

  // get the size of the player
  const playerWidth = player.width - 4;
  const playerHeight = player.height - 4;

  // get the size of the object
  const objectWidth = object.width - 4;
  const objectHeight = object.height - 4;

  // get the position of the object
  const objectX = object.position.x;
  const objectY = object.position.y;

  // check if the player is in the top of the object
  if (
    objectY < playerY + playerHeight &&
    objectY + objectHeight > playerY &&
    objectX < playerX + playerWidth &&
    objectX + objectWidth > playerX
  ) {
    return true;
  }
  return false;
}

function gameLoop(delta) {
  touchingGround =
    testCollision(
      player.position.x + 2,
      player.position.y + tileSize * 2 + 1
    ) ||
    testCollision(
      player.position.x + tileSize - 3,
      player.position.y + tileSize * 2 + 1
    );

  player.vy = Math.min(12, player.vy + 1);
  if (player.vx > 0) {
    player.vx -= 1;
  }
  if (player.vx < 0) {
    player.vx += 1;
  }

  if (player.vy > 0) {
    for (let i = 0; i < player.vy; i++) {
      const testX1 = player.position.x + 2;
      const testX2 = player.position.x + tileSize - 3;
      const testY = player.position.y + tileSize * 2;
      if (
        testY > height * tileSize ||
        testCollision(testX1, testY) ||
        testCollision(testX2, testY)
      ) {
        player.vy = 0;
        break;
      }
      player.y += 1;
    }
  }

  if (player.vy < 0) {
    for (let i = player.vy; i < 0; i++) {
      const testX1 = player.position.x + 2;
      const testX2 = player.position.x + tileSize - 3;
      const testY = player.position.y + 5;
      if (testCollision(testX1, testY) || testCollision(testX2, testY)) {
        player.vy = 0;
        break;
      }
      player.y -= 1;
    }
  }

  if (player.jumped) {
    if (player.vy < 0 && player.textures !== [resources.player_jump.texture]) {
      player.textures = [resources.player_jump.texture];
      player.play();
    } else if (
      player.vy > 0 &&
      player.textures !== [resources.player_fall.texture]
    ) {
      player.textures = [resources.player_fall.texture];
      player.play();
    }
  } else if (player.vx !== 0) {
    if (
      player.textures !== resources.player_run.spritesheet.animations.player_run
    ) {
      player.textures = resources.player_run.spritesheet.animations.player_run;
      player.play();
    }
  } else if (
    player.textures !== resources.player_idle.spritesheet.animations.player_idle
  ) {
    player.textures = resources.player_idle.spritesheet.animations.player_idle;
    player.play();
  }

  if (player.vx > 0) {
    player.direction = 0;
    for (let i = 0; i < player.vx; i++) {
      const testX = player.position.x + tileSize - 2;
      const testY1 = player.position.y + 5;
      const testY2 = player.position.y + tileSize;
      const testY3 = player.position.y + tileSize * 2 - 1;
      player.scale.x = 1;
      player.anchor.x = 0;
      if (
        testX >= width * tileSize ||
        testCollision(testX, testY1) ||
        testCollision(testX, testY2) ||
        testCollision(testX, testY3)
      ) {
        player.vx = 0;
        break;
      }
      player.position.x += 1;
    }
  }

  if (player.vx < 0) {
    player.direction = 1;
    for (let i = player.vx; i < 0; i++) {
      const testX = player.position.x + 1;
      const testY1 = player.position.y + 5;
      const testY2 = player.position.y + tileSize;
      const testY3 = player.position.y + tileSize * 2 - 1;
      player.scale.x = -1;
      player.anchor.x = 1;
      if (
        testX < 0 ||
        testCollision(testX, testY1) ||
        testCollision(testX, testY2) ||
        testCollision(testX, testY3)
      ) {
        player.vx = 0;
        break;
      }
      player.x -= 1;
    }
  }

  if (kb.pressed.ArrowRight) {
    player.direction = 0;
    player.vx = Math.min(8, player.vx + 2);
  }
  if (kb.pressed.ArrowLeft) {
    player.direction = 1;
    player.vx = Math.max(-6, player.vx - 2);
  }
  if (!kb.pressed.ArrowUp && touchingGround && player.jumped) {
    player.jumped = false;
  }
  if (kb.pressed.ArrowUp && touchingGround && !player.jumped) {
    player.vy = -12;
    player.jumped = true;
  }

  rockHeads.forEach((rockHead) => {
    rockHead.routine();
    // if (checkCollisionOnTop(rockHead)) {
    //   player.vy = 0;
    //   player.position.y = rockHead.position.y - tileSize * 1.5;
    //   player.position.x = rockHead.position.x + tileSize / 2;
    // }
  });

  apples.forEach((apple) => {
    if (checkCollision(player, apple)) {
      player.increaseApples += 1;
      apple.collected();
    }
  });

  checkpoints.forEach((checkpoint) => {
    if (checkpoint.completed) return;
    if (checkCollision(player, checkpoint)) {
      checkpoint.achieved();
    }
  });
}

function setCheckpoints() {
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
    const checkpoint = new PIXI.AnimatedSprite([
      resources.checkpoint_noflag.texture,
    ]);
    checkpoint.achieved = false;
    checkpoint.position.set(
      checkpointConfiguration.x,
      checkpointConfiguration.y
    );
    checkpoint.animationSpeed = 0.3;
    checkpoint.play();
    checkpoint.achieved = function () {
      this.completed = true;
      this.textures = resources.flag_out.spritesheet.animations.flag_out;
      this.loop = false;
      this.play();
      this.onComplete = function () {
        this.textures = resources.flag_idle.spritesheet.animations.flag_idle;
        this.loop = true;
        this.play();
      };
    };
    // checkpoint.scale.set(0.5);
    checkpoints.push(checkpoint);
    gameContainer.addChild(checkpoint);
  });
}

function setStartPoint() {
  const startPoint = new PIXI.AnimatedSprite(
    resources.start.spritesheet.animations.start
  );
  startPoint.position.set(485, 240);
  startPoint.animationSpeed = 0.3;
  startPoint.play();
  gameContainer.addChild(startPoint);
}

function setApples() {
  const applesConfiguration = [
    {
      nOfApples: 8,
      initialX: 55,
      initialY: 40,
      alignment: "vertical",
    },
    {
      nOfApples: 8,
      initialX: 225,
      initialY: 289,
      alignment: "horizontal",
    },
  ];

  applesConfiguration.forEach((appleConfiguration) => {
    for (let i = 0; i < appleConfiguration.nOfApples; i++) {
      const apple = new PIXI.AnimatedSprite(
        resources.apple.spritesheet.animations.apple
      );
      apple.position.set(
        appleConfiguration.initialX +
          (appleConfiguration.alignment === "horizontal" ? i * 32 : 0),
        appleConfiguration.initialY +
          (appleConfiguration.alignment === "vertical" ? i * 32 : 0)
      );

      apple.animationSpeed = 0.3;
      apple.play();

      apple.collected = function () {
        apples.splice(apples.indexOf(apple), 1);
        this.textures =
          resources.fruit_collected.spritesheet.animations.fruit_collected;
        this.loop = false;
        this.play();
        this.onComplete = function () {
          gameContainer.removeChild(this);
          this.destroy();
        };
      };

      gameContainer.addChild(apple);
      apples.push(apple);
    }
  });
}

function setBackground() {
  backgroundTilemap = new CompositeTilemap();
  // prettier-ignore
  const backgroundMatrix = [
    [ 6, 5, 5, 5, 5, 5, 5, 5, 5, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 8],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  ];

  const distant = 64;
  backgroundMatrix.forEach((tile, indexY) => {
    const y = indexY * distant;
    tile.forEach((col, indexX) => {
      const x = indexX * distant;
      if (col === 1) backgroundTilemap.tile("green", x, y);
      if (col === 2) {
        backgroundTilemap.tile("green", x, y, {
          tileHeight: 32,
        });
      }
      if (col === 3) {
        backgroundTilemap.tile("green", x, y, {
          tileWidth: 32,
        });
      }
      if (col === 4) {
        backgroundTilemap.tile("green", x, y, {
          tileHeight: 32,
          tileWidth: 32,
        });
      }
      if (col === 5) {
        backgroundTilemap.tile("green", x, y + 32, {
          tileHeight: 32,
          rotate: 4,
        });
      }
      if (col === 6) {
        backgroundTilemap.tile("green", x + 32, y + 32, {
          tileHeight: 32,
          tileWidth: 32,
          rotate: 4,
        });
      }
      if (col === 7) {
        backgroundTilemap.tile("green", x + 32, y, {
          tileWidth: 32,
          rotate: 4,
        });
      }
      if (col === 8) {
        backgroundTilemap.tile("green", x, y + 16, {
          tileWidth: 48,
          tileHeight: 32,
          rotate: 4,
        });
      }
    });
  });
  gameContainer.addChild(backgroundTilemap);
}

function setMainScene() {
  const terrainTextures = resources.terrain.textures;
  // prettier-ignore
  const scenarioTextures = [
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ -1,  3, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35,  4, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1,  5,  6,  6,  6,  6,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 23, 38, 38, 38, 39, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 34, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,132,133,100, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 25,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  7, 60, 61, 61, 61, 61, 61, 61, 61, 62,  5,  6,  6,  7,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 79, 80, 80, 80, 80, 80, 80, 80, 81, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 37, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 93, 94, 94, 94, 94, 94, 94, 94, 95, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,125,126,124, -1, -1, -1, -1, -1, -1, -1, -1,124, -1, -1, -1, -1, -1, -1, -1, -1, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,138,139, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1,  5,  6,  6,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 22, 23,125,126,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1,  5, 26,124, 38, 39, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  5,  6,  6,  7, 38,138,139,114, -1],
    [ -1,117, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,118, -1],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    
  ]

  // prettier-ignore
  collisionsMap = [
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  ]

  scenarioTextures.forEach((row, rowIndex) => {
    row.forEach((colValue, colIndex) => {
      if (colValue === -1) return;
      const texturesArray = Object.values(terrainTextures);
      const texture = texturesArray[colValue];
      const sprite = new Sprite(texture);
      sprite.position.set(colIndex * texture.width, rowIndex * texture.height);

      gameContainer.addChild(sprite);
    });
  });
}

function setPlayer() {
  player = new PIXI.AnimatedSprite(
    resources.player_idle.spritesheet.animations.player_idle
  );
  player.vx = 0;
  player.vy = 0;
  player.healthPoints = 4;
  player.increaseApples = 0;
  player.position.set(510, 250);
  player.animationSpeed = 0.3;
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
  gameContainer.addChild(player);
}

function setRockHeads() {
  // const rockHead = new Sprite(resources.rock_head_idle.texture);
  // rockHead.position.set(186, 283);
  // rockHead.velocity = 4;
  // rockHead.direction = 1;
  // rockHead.vx = 4;
  // rockHead.vy = 4;
  // rockHead.start = {
  //   x: 186,
  //   y: 283,
  // };
  // rockHead.end = {
  //   x: 460,
  //   y: 283,
  // };
  // rockHead.routine = routine;
  // rockHeads.push(rockHead);

  const rockHead = new PIXI.AnimatedSprite([resources.rock_head_idle.texture]);
  const rockHeadHit = ({ animation } = {}) => {
    rockHead.textures = animation;
    rockHead.play();
    rockHead.loop = false;
    rockHead.onComplete = () => {
      rockHead.textures = [resources.rock_head_idle.texture];
    };
  };
  rockHead.position.set(50, 27);
  rockHead.velocity = 4;
  rockHead.direction = 1;
  rockHead.vx = 4;
  rockHead.vy = 4;
  rockHead.start = { x: 50, y: 27 };
  rockHead.end = { x: 50, y: 283 };
  rockHead.animationSpeed = 0.3;
  rockHead.topHit = function () {
    rockHeadHit({
      animation:
        resources.rock_head_top_hit.spritesheet.animations.rock_head_top_hit,
    });
  };
  rockHead.bottomHit = function () {
    rockHeadHit({
      animation:
        resources.rock_head_bottom_hit.spritesheet.animations
          .rock_head_bottom_hit,
    });
  };

  rockHead.routine = function () {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
      if (progressY === 0) this.bottomHit();
    } else if (this.direction === -1) {
      progressX = this.position.x - this.start.x;
      progressY = this.position.y - this.start.y;
      goal = { x: this.start.x, y: this.start.y };
      if (progressY === 0) this.topHit();
    }

    if (progressX !== 0)
      this.position.x =
        progressX <= this.velocity
          ? goal.x
          : this.position.x + this.velocity * this.direction;

    if (progressY !== 0)
      this.position.y =
        progressY <= this.velocity
          ? goal.y
          : this.position.y + this.velocity * this.direction;

    if (progressX === 0 && progressY === 0) {
      this.direction = -this.direction;
    }
  };

  rockHeads.push(rockHead);

  // gameContainer.addChild(rockHead);
  gameContainer.addChild(rockHead);
}

function setHealthBar() {
  healthBar = new PIXI.Graphics();
  healthBar.beginFill(0x000000);
  healthBar.drawRect(0, 0, 100, 10);
  healthBar.endFill();
  healthBar.position.set(23, 10);
  healthBar.scale.set(1, 1);
  healthBar.setHealthPoints = function setHealthPoints(healthPoints = 4) {
    this.healthPoints = healthPoints;
  };
  healthBar.incrementHealthPoints = function incrementHealthPoints() {
    this.healthPoints += 1;
  };
  healthBar.decrementHealthPoints = function decrementHealthPoints() {
    this.healthPoints -= 1;
  };
  gameContainer.addChild(healthBar);

  healthBar.setHealthPoints(player.healthPoints);
}

function setup() {
  setBackground();
  setMainScene();
  setStartPoint();
  setPlayer();
  setRockHeads();
  setHealthBar();
  setApples();
  setCheckpoints();

  app.ticker.add(gameLoop);
}

loader
  .add("background", "./assets/images/background.json")
  .add("terrain", "./assets/images/terrain.json")
  .add("player_idle", "./assets/images/player_idle.json")
  .add("player_run", "./assets/images/player_run.json")
  .add("player_jump", "./assets/images/player_jump.png")
  .add("player_fall", "./assets/images/player_fall.png")
  .add("rock_head_idle", "./assets/images/rock_head_idle.png")
  .add("rock_head_blink", "./assets/images/rock_head_blink.json")
  .add("rock_head_top_hit", "./assets/images/rock_head_top_hit.json")
  .add("rock_head_bottom_hit", "./assets/images/rock_head_bottom_hit.json")
  .add("apple", "./assets/images/apple.json")
  .add("fruit_collected", "./assets/images/fruit_collected.json")
  .add("start", "./assets/images/start.json")
  .add("start_idle", "./assets/images/start_idle.png")
  .add("checkpoint_noflag", "./assets/images/checkpoint_noflag.png")
  .add("flag_out", "./assets/images/flag_out.json")
  .add("flag_idle", "./assets/images/flag_idle.json")
  .load(setup);

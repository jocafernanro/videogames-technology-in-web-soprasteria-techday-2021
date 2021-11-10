/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
import "./assets/styles/style.css";
import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";

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

  rockHeads.forEach((rockHead) => rockHead.routine());

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
  player.position.set(500, 250);
  player.animationSpeed = 0.3;
  player.hasCollidedWith = function hasCollidedWith(object) {
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
  const routine = function routine() {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
    } else if (this.direction === -1) {
      progressX = this.position.x - this.start.x;
      progressY = this.position.y - this.start.y;
      goal = { x: this.start.x, y: this.start.y };
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

  const rockHead = new Sprite(resources.rock_head_idle.texture);
  rockHead.position.set(186, 283);
  rockHead.velocity = 4;
  rockHead.direction = 1;
  rockHead.vx = 4;
  rockHead.vy = 4;
  rockHead.start = {
    x: 186,
    y: 283,
  };
  rockHead.end = {
    x: 460,
    y: 283,
  };
  rockHead.routine = routine;
  rockHeads.push(rockHead);

  const rockHead2 = new Sprite(resources.rock_head_idle.texture);
  rockHead2.position.set(50, 27);
  rockHead2.velocity = 4;
  rockHead2.direction = 1;
  rockHead2.vx = 4;
  rockHead2.vy = 4;
  rockHead2.start = { x: 50, y: 27 };
  rockHead2.end = { x: 50, y: 283 };
  rockHead2.routine = routine;
  rockHeads.push(rockHead2);

  gameContainer.addChild(rockHead);
  gameContainer.addChild(rockHead2);
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
  setPlayer();
  setRockHeads();
  setHealthBar();

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
  .load(setup);

import * as PIXI from "pixi.js";
import { Howl, Howler } from "howler";

const { Application, Container, Graphics, Sprite } = PIXI;
const { resources } = PIXI.Loader.shared;

class Game {
  constructor(width = 1280, resolutionRatio = 1.7777777777777777) {
    const height = Math.round(width / resolutionRatio);
    this.app = new Application({
      backgroundColor: 0x211f30,
      width,
      height,
      roundPixels: true,
      antialias: true,
      transparent: false,
      resolution: 1,
    });

    this.utils = "new SpriteUtilities(PIXI);";

    this.scenes = {
      intro: {},
      game: {},
      gameOver: {},
      youWin: {},
    };

    this.sounds = {};
    this.bgSounds = {};

    this.keys = {};
    this.gravity = 0.5;

    this.attachEvents();

    PIXI.loader
      .add([
        { name: "background", url: "./assets/images/background.json" },
        { name: "terrain", url: "./assets/images/terrain.json" },
        { name: "shadow", url: "./assets/images/shadow.png" },
        { name: "player_idle", url: "./assets/images/player_idle.json" },
        { name: "player_run", url: "./assets/images/player_run.json" },
        { name: "player_jump", url: "./assets/images/player_jump.png" },
        { name: "player_fall", url: "./assets/images/player_fall.png" },
        {
          name: "player_appearing",
          url: "./assets/images/player_appearing.json",
        },
        {
          name: "player_disappearing",
          url: "./assets/images/player_desappearing.json",
        },
        { name: "player_hit", url: "./assets/images/player_hit.json" },
        { name: "rock_head_idle", url: "./assets/images/rock_head_idle.png" },
        {
          name: "rock_head_blink",
          url: "./assets/images/rock_head_blink.json",
        },
        {
          name: "rock_head_top_hit",
          url: "./assets/images/rock_head_top_hit.json",
        },
        {
          name: "rock_head_bottom_hit",
          url: "./assets/images/rock_head_bottom_hit.json",
        },
        { name: "apple", url: "./assets/images/apple.json" },
        { name: "banana", url: "./assets/images/banana.json" },
        { name: "orange", url: "./assets/images/orange.json" },
        { name: "melon", url: "./assets/images/melon.json" },
        {
          name: "fruit_collected",
          url: "./assets/images/fruit_collected.json",
        },
        { name: "start", url: "./assets/images/start.json" },
        { name: "start_idle", url: "./assets/images/start_idle.png" },
        {
          name: "checkpoint_noflag",
          url: "./assets/images/checkpoint_noflag.png",
        },
        { name: "flag_out", url: "./assets/images/flag_out.json" },
        { name: "flag_idle", url: "./assets/images/flag_idle.json" },
        { name: "box_idle", url: "./assets/images/box_idle.png" },
        { name: "box_break", url: "./assets/images/box_break.json" },
        { name: "box_hit", url: "./assets/images/box_hit.json" },
        { name: "slime_idle_run", url: "./assets/images/slime_run_idle.json" },
        { name: "rabbit_idle", url: "./assets/images/rabbit_idle.json" },
        { name: "rabbit_hit", url: "./assets/images/rabbit_hit.json" },
        { name: "rabbit_run", url: "./assets/images/rabbit_run.json" },
        { name: "end_pressed", url: "./assets/images/end_pressed.json" },
        { name: "end_idle", url: "./assets/images/end_idle.png" },
        { name: "platform_on", url: "./assets/images/platform_on.json" },
        { name: "platform_off", url: "./assets/images/platform_off.png" },
        { name: "key", url: "./assets/images/key.png" },
        { name: "text_black", url: "./assets/images/text_black.json" },
        { name: "text_white", url: "./assets/images/text_white.json" },
        { name: "heart_idle", url: "./assets/images/heart_idle.json" },
        { name: "heart_hit", url: "./assets/images/heart_hit.json" },
        { name: "volume_button", url: "./assets/images/buttons/volume.png" },
        { name: "restart_button", url: "./assets/images/buttons/restart.png" },
        { name: "game_sounds", url: "./assets/audio/gameSounds.json" },
      ])
      .load(() => {
        this.initSounds();
        this.initGame();
      });
    document.querySelector("#main-container").appendChild(this.app.view);
  }

  initScenes() {
    this.scenes.forEach((scene) => {
      this.scenes[scene] = new PIXI.Container();
      this.scenes[scene].alpha = 0;
      this.app.stage.addChild(this.scenes[scene]);
    });
  }

  setActiveScene(sceneName) {
    this.scenes.forEach((scene) => {
      this.scenes[scene].visible = false;
      if (scene === sceneName) {
        this.scenes[scene].visible = true;
      }
    });
  }

  initSounds() {
    this.sounds = new Howl(resources.game_sounds.data);
    this.bgSounds = new Howl({
      src: ["./assets/audio/background.wav"],
      loop: true,
    });
  }

  stopSound() {
    if (this.sound) {
      this.sound.stop();
    }
  }

  stopBgSound() {
    this.bgSound.stop();
  }
}

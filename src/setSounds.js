import { Loader } from "pixi.js";
import { Howl } from "howler";

const { resources } = Loader.shared;

export default function setSounds() {
  const sounds = new Howl(resources.game_sounds.data);
  // sounds.volume(0);

  // const appearing = sounds.play("appearing");
  // const box = sounds.play("box");
  // const boxHit = sounds.play("box_hit");
  // const boxHitReward = sounds.play("box_hit_reward");
  // const checkpointUnlocked = sounds.play("checkpoint_unlocked");
  // const end = sounds.play("end");
  // const fruit = sounds.play("fruit");
  // const fruit2 = sounds.play("fruit2");
  // const jump = sounds.play("jump");
  // const key = sounds.play("key");
  // const landing = sounds.play("landing");
  // const playerHit = sounds.play("player_hit");
  // const steps = sounds.play("steps");
  // const unlockBarrier = sounds.play("unlock_barrier");

  // // sounds.volume(0, appearing);
  // // sounds.volume(1, box);
  // // sounds.volume(1, boxHit);
  // // sounds.volume(0, boxHitReward);
  // // sounds.volume(0, checkpointUnlocked);
  // // sounds.volume(0, end);
  // // sounds.volume(1, fruit);
  // // sounds.volume(0, fruit2);
  // // sounds.volume(0, jump);
  // // sounds.volume(0, key);
  // // sounds.volume(1, landing);
  // // sounds.volume(0, playerHit);
  // // sounds.volume(0, steps);
  // // sounds.volume(0, unlockBarrier);

  return sounds;
}

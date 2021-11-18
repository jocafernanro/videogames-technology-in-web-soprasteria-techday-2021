export default class Keyboard {
  constructor() {
    this.pressed = {};
  }

  watch(el) {
    el.addEventListener("keydown", (e) => {
      console.log(e);
      this.pressed[e.key] = true;
    });
    el.addEventListener("keyup", (e) => {
      this.pressed[e.key] = false;
    });
  }
}

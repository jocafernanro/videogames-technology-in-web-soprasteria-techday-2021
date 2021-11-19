export default class Keyboard {
  constructor() {
    this.pressed = {};
  }

  watch(el) {
    el.addEventListener("keydown", (e) => {
      console.log(e);
      this.pressed[e.key] = true;
      console.log(this.pressed);
    });
    el.addEventListener("keyup", (e) => {
      this.pressed[e.key] = false;
      console.log(this.pressed);
    });
  }
}

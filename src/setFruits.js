import { AnimatedSprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export default function setFruits(gameContainer, fruits, sounds) {
  const fruitsConfiguration = [
    {
      nOfFruits: 6,
      initialX: 55,
      initialY: 45,
      alignment: "vertical",
      separation: 45,
      fruit: "apple",
    },
    {
      nOfFruits: 5,
      initialX: 225,
      initialY: 289,
      alignment: "horizontal",
      separation: 50,
      fruit: "melon",
    },
    {
      nOfFruits: 8,
      initialX: 245,
      initialY: 100,
      alignment: "horizontal",
      separation: 30,
      fruit: "orange",
    },
    {
      nOfFruits: 8,
      initialX: 245,
      initialY: 40,
      alignment: "horizontal",
      separation: 30,
      fruit: "banana",
    },
  ];

  fruitsConfiguration.forEach((fruitConfiguration) => {
    for (let i = 0; i < fruitConfiguration.nOfFruits; i++) {
      const fruit = new AnimatedSprite(
        resources[fruitConfiguration.fruit].spritesheet.animations[
          fruitConfiguration.fruit
        ]
      );
      fruit.position.set(
        fruitConfiguration.initialX +
          (fruitConfiguration.alignment === "horizontal"
            ? i * fruitConfiguration.separation
            : 0),
        fruitConfiguration.initialY +
          (fruitConfiguration.alignment === "vertical"
            ? i * fruitConfiguration.separation
            : 0)
      );

      fruit.animationSpeed = 0.3;
      fruit.play();

      fruit.collected = function () {
        sounds.play("fruit");
        fruits.splice(fruits.indexOf(fruit), 1);
        this.textures =
          resources.fruit_collected.spritesheet.animations.fruit_collected;
        this.loop = false;
        this.play();
        this.onComplete = function () {
          gameContainer.removeChild(this);
          this.destroy();
        };
      };

      gameContainer.addChild(fruit);
      fruits.push(fruit);
    }
  });
}

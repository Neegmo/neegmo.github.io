// import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  goodPlatforms;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  badPlatforms;

  canChangeBalance = false;

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;

  matrixValue;

  timer;
  timerValue = 0.2;

  spawningReferencePlatformHeight;
  spawnHeightOffset = 0;

  canLerpPlayer = false;
  lerpStartPosition;
  lerpTargetPosition;
  lerpStep;

  debugText

  constructor() {
    super("game");
  } //constructor

  init() {
    this.timer = this.timerValue;

    this.lerpStep = 0;
  } //init

  preload() {
    this.load.image("background", "assets/bg_layer1.png");
    this.load.image("platform", "assets/ground_wood.png");
    this.load.image("bunny-stand", "assets/bunny1_stand.png");
    // this.load.image('carrot', 'assets/carrot.png')
    this.load.image("bunny-jump", "assets/bunny1_jump.png");
    this.load.image("bad-platform", "assets/ground_snow.png");
    this.load.image("good-platform", "assets/ground_grass.png");

    this.load.audio("jump", "assets/sfx/phaseJump1.ogg");

    this.cursors = this.input.keyboard.createCursorKeys();
  } //preload

  create() {
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    this.goodPlatforms = this.physics.add.staticGroup();

    this.badPlatforms = this.physics.add.staticGroup();

    const startPlatform = this.physics.add
      .staticSprite(235, 580, "platform")
      .setScale(0.3);
    startPlatform.body.updateFromGameObject();

    this.CreatePlatformMatrix();

    this.player = this.physics.add
      .sprite(240, 500, "bunny-stand")
      .setScale(0.5);

    this.physics.add.collider(startPlatform, this.player);

    this.physics.add.collider(
      this.goodPlatforms,
      this.player,
      this.RewardPlayer,
      undefined,
      this
    );

    this.physics.add.collider(
      this.badPlatforms,
      this.player,
      this.HurtPlayer,
      undefined,
      this
    );

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    const style = { color: '#000', fontSize: 24 }
    this.debugText =  this.add.text(240, 50, 'Debug', style).setScrollFactor(0).setOrigin(0.5, 0)

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      this.PlayerJump();

      this.canLerpPlayer = true;
      this.lerpTargetPosition = gameObject.x;
      this.lerpStartPosition = this.player.x;

      this.debugText.text = gameObject.x

    });
  } //create

  update() {
    this.PlayerLerper();

    this.CheckIfPlayerIsFalling();

    this.movePlayer();

    this.horizontalWrap(this.player);

    this.InstantiateNewPlatformGroup();
  } //update

  GetDeltaTime() {
    return this.game.loop.delta / 1000;
  }

  movePlayer() {
    const touchingDown = this.player.body.touching.down;

    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && touchingDown) {
      this.PlayerJump();

      // this.timer -= this.GetDeltaTime()
      // if(this.timer <= 0){
      // }
    }

    // if(this.cursors.up.isDown){
    //     this.player.setVelocityY(-200)
    // }
    // else if (this.cursors.down.isDown){
    //     this.player.setVelocityY(200)
    // }
    // else {
    //     this.player.setVelocityY(0)
    // }
  } //movePlayer

  PlayerLerper() {
    if (this.canLerpPlayer) {
      this.lerpStep += this.GetDeltaTime();

      this.player.x = Phaser.Math.Linear(
        this.lerpStartPosition,
        this.lerpTargetPosition,
        this.lerpStep
      );

      if (this.lerpStep >= 1) {
        this.canLerpPlayer = false;
        this.lerpStep = 0;
      }
    }
  }

  PlayerJump() {
    this.player.setVelocityY(-400);

    this.player.setTexture("bunny-jump");

    this.sound.play("jump");

    this.timer = this.timerValue;
  } //PlayerJump

  CheckIfPlayerIsFalling() {
    const vy = this.player.body.velocity.y;
    if (vy > 0) {
      this.canChangeBalance = true;

      if (this.player.texture.key !== "buny-stand")
        this.player.setTexture("bunny-stand");
    }
  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  } // horizontalWrap

  CreateMatrixValue() {
    this.matrixValue = [
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
      [
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
        Phaser.Math.Between(0, 2),
      ],
    ];
  } //CreateMatrixValue

  CreatePlatformMatrix() {
    this.CreateMatrixValue();

    for (let i = 0; i < 10; ++i) {
      const y = 400 - 180 * i + this.spawnHeightOffset;

      if (
        this.matrixValue[i][0] === 0 &&
        this.matrixValue[i][1] === 0 &&
        this.matrixValue[i][2] === 0
      ) {
        /**@type {Phaser.Physics.Arcade.Sprite} */
        const platform = this.badPlatforms.create(235, y, "platform");
        platform.scale = 0.35;

        /**@type {Phaser.Physics.Arcade.StaticBody} */
        const body = platform.body;
        body.updateFromGameObject();

        platform.setInteractive();

        continue;
      }

      for (let j = 0; j < 3; ++j) {
        const x = 75 + 160 * j;
        if (this.matrixValue[i][j] === 1) {
          /**@type {Phaser.Physics.Arcade.Sprite} */
          const platform = this.goodPlatforms.create(x, y, "platform");
          platform.scale = 0.35;

          /**@type {Phaser.Physics.Arcade.StaticBody} */
          const body = platform.body;
          body.updateFromGameObject();

          platform.setInteractive();
        } else if (this.matrixValue[i][j] === 2) {
          const x = 75 + 160 * j;

          /**@type {Phaser.Physics.Arcade.Sprite} */
          const platform = this.badPlatforms.create(x, y, "platform");
          platform.scale = 0.35;

          /**@type {Phaser.Physics.Arcade.StaticBody} */
          const body = platform.body;
          body.updateFromGameObject();

          platform.setInteractive();
        }
      }
    }

    // this.add.text(this.scale.width * 0.5, y, i, {
    //     fontSize: 24,
    //     color: '#000'
    // }).setOrigin(0.5)

    this.spawningReferencePlatformHeight =
      400 - 180 * 5 + this.spawnHeightOffset;
    this.spawnHeightOffset -= 1800;
  } //CreatePlatformMatrix

  InstantiateNewPlatformGroup() {
    if (this.player.y < this.spawningReferencePlatformHeight) {
      this.CreatePlatformMatrix();
    }
  } //InstantiateNewPlatformGroup

  HurtPlayer(player, platform) {
    if (
      this.canChangeBalance &&
      player.y + player.height / 2 > platform.y - platform.height / 2
    ) {
      platform.setTexture("bad-platform");

      this.canChangeBalance = false;
    }
  }

  RewardPlayer(player, platform) {
    if (
      this.canChangeBalance &&
      player.y + player.height / 2 > platform.y - platform.height / 2
    ) {
      platform.setTexture("good-platform");

      this.canChangeBalance = false;
    }
  }
}

<template>
  <div class="playcanvas-demo">
    <div v-show="false" class="indicators">
      <p v-show="left">
        ←
      </p>
      <p v-show="right">
        →
      </p>
      <p v-show="up">
        ↑
      </p>
      <p v-show="down">
        ↓
      </p>
      <p v-show="mouseLeft">
        ML
      </p>
      <p v-show="mouseRight">
        MR
      </p>
      <p v-show="mouseMiddle">
        MM
      </p>
      <p v-show="padLeft">
        PAD←
      </p>
      <p v-show="padRight">
        PAD→
      </p>
      <p v-show="padUp">
        PAD↑
      </p>
      <p v-show="padDown">
        PAD↓
      </p>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
const PlayCanvas = require('playcanvas');

export default {
  data () {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      mouseLeft: false,
      mouseRight: false,
      mouseMiddle: false,
      padLeft: false,
      padRight: false,
      padUp: false,
      padDown: false,
    };
  },
  mounted () {
    // PlayCanvas 初期化
    const canvas = this.$refs.canvas;
    const app = new PlayCanvas.Application(canvas);
    app.setCanvasFillMode(PlayCanvas.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(PlayCanvas.RESOLUTION_AUTO);
    window.addEventListener('resize', () => app.resizeCanvas());

    // Entity: 立体ボックス
    const box = new PlayCanvas.Entity('cube');
    box.addComponent('model', {
      type: 'box'
    });
    app.root.addChild(box);

    // Entity: カメラ
    const camera = new PlayCanvas.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new PlayCanvas.Color(0.1, 0.1, 0.1)
    });
    app.root.addChild(camera);
    camera.setPosition(0, 0, 3);
    camera.addComponent('audiolistener');

    // Asset: サウンド
    box.addComponent('sound');
    // 立体位置(Panpot)を無視して再生することもできる
    // box.sound.positional = false;
    box.sound.positional = true;
    box.sound.maxDistance = 10;
    app.assets.loadFromUrl('sounds/ficusel.mp3', 'audio', (error, asset) => {
      if (!error) {
        box.sound.addSlot('ficusel', {
          asset: asset.id,
          overlap: false,
          autoPlay: false,
          loop: true,
        });
        const sound = box.sound.play('ficusel');
        sound.volume = 0.5;
        // box.sound.
        // sound.pitch = 1.5;
        // sound.pitch = 0.5;
      } else {
        console.error(error);
      }
    });

    // Entity: 光源
    const light = new PlayCanvas.Entity('light');
    light.addComponent('light');
    app.root.addChild(light);
    light.setEulerAngles(45, 0, 0);

    // Input: キーボード
    const keyboard = new PlayCanvas.Keyboard(window, {
      preventDefault: true,
      stopPropagation: true,
    });

    // Input: マウス
    const mouse = new PlayCanvas.Mouse(document.body);
    mouse.disableContextMenu();

    // Input: ゲームパッド
    const gamepads = new PlayCanvas.GamePads();
    console.log('使用可能なゲームパッド', gamepads.poll());

    // Script: エンティティにスクリプトコンポーネントを追加して使う
    const script = PlayCanvas.createScript('TestScript', app);
    let turn = false;
    let first = true;
    let start = new Date();
    script.extend({
      /** @this PlayCanvas.ScriptType  */
      initialize () {
        console.log('初期化されます');
      },
      /** @this PlayCanvas.ScriptType  */
      postInitialize () {
        console.log('初期化されました');
      },
      /** @this PlayCanvas.ScriptType  */
      update (dt) {
        this.entity.rotate(10 * dt, 20 * dt, 30 * dt);
        this.entity.setPosition(
          this.entity.getPosition().x - (turn ? -0.05 : 0.05),
          this.entity.getPosition().y,
          this.entity.getPosition().z
        );

        const current = new Date();
        if (current.getTime() - start.getTime() >= (first ? 3000 : 6000)) {
          start = current;
          turn = !turn;
          first = false;
        }

        // console.log('更新されます');
      },
      /** @this PlayCanvas.ScriptType  */
      postUpdate () {
        // console.log('更新されました');
      },
      /** @this PlayCanvas.ScriptType  */
      swap (old) {
        // 古いインスタンスも参照できる
        console.log('ホットリロードされました', old);
      },
    });
    app.scripts.add(script);

    box.addComponent('script');
    box.script.create('TestScript');

    // rotate the box according to the delta time since the last frame
    app.on('update', () => {
      this.left = keyboard.isPressed(PlayCanvas.KEY_LEFT);
      this.right = keyboard.isPressed(PlayCanvas.KEY_RIGHT);
      this.up = keyboard.isPressed(PlayCanvas.KEY_UP);
      this.down = keyboard.isPressed(PlayCanvas.KEY_DOWN);

      this.mouseLeft = mouse.isPressed(PlayCanvas.MOUSEBUTTON_LEFT);
      this.mouseRight = mouse.isPressed(PlayCanvas.MOUSEBUTTON_RIGHT);
      this.mouseMiddle = mouse.isPressed(PlayCanvas.MOUSEBUTTON_MIDDLE);

      gamepads.update();
      this.padLeft = gamepads.isPressed(PlayCanvas.PAD_1, PlayCanvas.PAD_LEFT);
      this.padRight = gamepads.isPressed(PlayCanvas.PAD_1, PlayCanvas.PAD_RIGHT);
      this.padUp = gamepads.isPressed(PlayCanvas.PAD_1, PlayCanvas.PAD_UP);
      this.padDown = gamepads.isPressed(PlayCanvas.PAD_1, PlayCanvas.PAD_DOWN);
    });

    app.start();
  },
};
</script>

<style lang="scss">
.playcanvas-demo {
  margin: 0;
  overflow: hidden;
}
</style>

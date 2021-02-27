<template>
  <div class="playcanvas-demo">
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
    // create a PlayCanvas application
    const canvas = this.$refs.canvas;
    const app = new PlayCanvas.Application(canvas);

    // fill the available space at full resolution
    app.setCanvasFillMode(PlayCanvas.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(PlayCanvas.RESOLUTION_AUTO);

    // ensure canvas is resized when window changes size
    window.addEventListener('resize', () => app.resizeCanvas());

    // create box entity
    const box = new PlayCanvas.Entity('cube');
    box.addComponent('model', {
      type: 'box'
    });
    app.root.addChild(box);

    // create camera entity
    const camera = new PlayCanvas.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new PlayCanvas.Color(0.1, 0.1, 0.1)
    });
    app.root.addChild(camera);
    camera.setPosition(0, 0, 3);

    // create directional light entity
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
    script.extend({
      initialize () {
        console.log('初期化されます');
      },
      postInitialize () {
        console.log('初期化されました');
      },
      update (dt) {
        box.rotate(10 * dt, 20 * dt, 30 * dt);
        // console.log('更新されます');
      },
      postUpdate () {
        // console.log('更新されました');
      },
      swap (old) {
        // 古いインスタンスも参照できる
        console.log('ホットリロードされました', old);
      },
    });
    app.scripts.add(script);

    box.addComponent('script');
    box.script.create('TestScript');

    // rotate the box according to the delta time since the last frame
    app.on('update', (dt) => {
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

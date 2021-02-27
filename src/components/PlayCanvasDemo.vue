<template>
  <div class="playcanvas-demo">
    <p v-show="left">←</p>
    <p v-show="right">→</p>
    <p v-show="up">↑</p>
    <p v-show="down">↓</p>
    <p v-show="mouseLeft">ML</p>
    <p v-show="mouseRight">MR</p>
    <p v-show="mouseMiddle">MM</p>
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

    const keyboard = new PlayCanvas.Keyboard(window, {
      preventDefault: true,
      stopPropagation: true,
    });

    const mouse = new PlayCanvas.Mouse(document.body);
    mouse.disableContextMenu();

    // rotate the box according to the delta time since the last frame
    app.on('update', (dt) => {
      box.rotate(10 * dt, 20 * dt, 30 * dt);

      this.left = keyboard.isPressed(PlayCanvas.KEY_LEFT);
      this.right = keyboard.isPressed(PlayCanvas.KEY_RIGHT);
      this.up = keyboard.isPressed(PlayCanvas.KEY_UP);
      this.down = keyboard.isPressed(PlayCanvas.KEY_DOWN);

      this.mouseLeft = mouse.isPressed(PlayCanvas.MOUSEBUTTON_LEFT);
      this.mouseRight = mouse.isPressed(PlayCanvas.MOUSEBUTTON_RIGHT);
      this.mouseMiddle = mouse.isPressed(PlayCanvas.MOUSEBUTTON_MIDDLE);
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

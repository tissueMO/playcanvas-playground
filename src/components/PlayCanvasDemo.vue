<template>
  <div class="playcanvas-demo">
    <canvas class="playcanvas-demo-canvas"></canvas>
  </div>
</template>

<script>
const PlayCanvas = require('playcanvas');

export default {
  mounted () {
    // create a PlayCanvas application
    const canvas = document.querySelector('.playcanvas-demo-canvas');
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

    // rotate the box according to the delta time since the last frame
    app.on('update', dt => box.rotate(10 * dt, 20 * dt, 30 * dt));

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

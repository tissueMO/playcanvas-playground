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
window.engine = PlayCanvas;

function resizeHandler () {
  window.app.resizeCanvas();
}

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
    // Vue ホットリロード対応
    if (window.app) {
      /** @type PlayCanvas.Application */
      const oldApp = window.app;
      console.log('古いアプリケーション', oldApp);
      oldApp.destroy();
    }

    // PlayCanvas 初期化
    const canvas = this.$refs.canvas;
    const app = new PlayCanvas.Application(canvas);
    window.app = app;
    app.setCanvasResolution(PlayCanvas.RESOLUTION_AUTO, 1920, 1080);
    app.setCanvasFillMode(PlayCanvas.FILLMODE_KEEP_ASPECT);
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);

    // Entity: 立体ボックス
    const box = new PlayCanvas.Entity('cube');
    box.addComponent('model', { type: 'box' });
    app.root.addChild(box);

    // Entity: カメラ
    const camera = new PlayCanvas.Entity('camera');
    camera.addComponent('camera', { clearColor: new PlayCanvas.Color(0.1, 0.1, 0.1) });
    app.root.addChild(camera);
    camera.setPosition(0, 0, 10);
    // オーディオリスナーは最後に付けられたものが有効になる
    camera.addComponent('audiolistener');

    // Asset: サウンド
    box.addComponent('sound');
    // 立体位置(Panpot)を無視して再生することもできる
    // box.sound.positional = false;
    box.sound.positional = true;
    box.sound.maxDistance = 20;
    app.assets.loadFromUrl('sounds/ficusel.mp3', 'audio', (error, asset) => {
      if (error) {
        console.error(error);
        return;
      }

      box.sound.addSlot('ficusel', {
        asset: asset.id,
        overlap: false,
        autoPlay: true,
        loop: true,
        volume: 0,
        // volume: 0.5,
      });

      // addSlotのautoPlayを指定せず後から手動で再生したり設定を変更することもできる
      // const sound = box.sound.play('ficusel');
      // sound.volume = 0.5;
      // sound.pitch = 1.5;
      // sound.pitch = 0.5;
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
    console.info('使用可能なゲームパッド', gamepads.poll());

    // Script: エンティティにスクリプトコンポーネントを追加して使う
    const script = PlayCanvas.createScript('TestScript', app);
    let turn = false;
    let first = true;
    let start = new Date();
    script.extend({
      /** @this PlayCanvas.ScriptType  */
      initialize () {
        // console.log('初期化されます');
      },
      /** @this PlayCanvas.ScriptType  */
      postInitialize () {
        // console.log('初期化されました');
      },
      /** @this PlayCanvas.ScriptType  */
      update (dt) {
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
      /** @param {PlayCanvas.ScriptType} old */
      swap (old) {
        // 古いインスタンスも参照できる
        console.log('ホットリロードされました', old);
      },
    });
    app.scripts.add(script);
    box.addComponent('script');
    box.script.create('TestScript');

    // Asset: スクリプト
    app.assets.loadFromUrl('scripts/box.js', 'script', (error, asset) => {
      if (!error) {
        box.script.create('boxRotate');
      } else {
        console.error(error);
      }
    });

    // Entity: 2Dグラフィック
    const sprite2d = new PlayCanvas.Entity('sprite');
    sprite2d.setPosition(0, 0, -5);
    sprite2d.setLocalScale(0.01, 0.01, 0.01);
    sprite2d.addComponent('sprite');
    app.root.addChild(sprite2d);
    app.assets.loadFromUrl('sprites/pipoya.jpg', 'texture', (error, asset) => {
      if (!error) {
        /** @type PlayCanvas.Texture */
        const texture = asset.resource;
        const textureAtlas = new PlayCanvas.TextureAtlas();
        textureAtlas.texture = texture;
        textureAtlas.frames = {
          1: {
            rect: new PlayCanvas.Vec4(0, 0, texture.width, texture.height),
            pivot: new PlayCanvas.Vec2(0.5, 0.5),
            border: new PlayCanvas.Vec4(0, 0, 0, 0),
          },
        };
        sprite2d.sprite.sprite = new PlayCanvas.Sprite(app.graphicsDevice, {
          atlas: textureAtlas,
          frameKeys: [1],
        });
      } else {
        console.error(error);
      }
    });

    // Entity: スクリーン
    const screen = new PlayCanvas.Entity('screen');
    screen.addComponent('screen');
    screen.screen.referenceResolution = new PlayCanvas.Vec2(1920, 1080);
    screen.screen.screenSpace = true;
    screen.screen.scaleMode = PlayCanvas.SCALEMODE_BLEND;
    app.root.addChild(screen);

    // Entity: UIテキスト
    const text = new PlayCanvas.Entity('text');
    screen.addChild(text);

    // 動的にフォントをロード
    const fontFace = new FontFace('mplus', 'url(fonts/mplus-1m-regular.ttf)');
    const textCharacters = '0123456789';
    document.fonts.add(fontFace);
    fontFace.load().then(() => {
      // 動的にフォントビットマップを生成する
      const font = new PlayCanvas.CanvasFont(app, {
        fontName: 'mplus',
        fontSize: 128,
      });
      font.createTextures(textCharacters);

      // 生成したフォントを使ってUIテキストを作る
      text.addComponent('element', {
        // 右下固定
        anchor: new PlayCanvas.Vec4(1, 0, 1, 0),
        // 右下起点
        pivot: new PlayCanvas.Vec2(1, 0),
        // 起点からのオフセット
        right: 30,

        font,
        fontSize: 96,
        text: textCharacters,
        type: PlayCanvas.ELEMENTTYPE_TEXT,
      });
    });

    // アプリケーショングローバルなフレーム更新
    app.on('update', (dt) => {
      this.left = keyboard.isPressed(PlayCanvas.KEY_LEFT);
      this.right = keyboard.isPressed(PlayCanvas.KEY_RIGHT);
      this.up = keyboard.isPressed(PlayCanvas.KEY_UP);
      this.down = keyboard.isPressed(PlayCanvas.KEY_DOWN);

      sprite2d.setPosition(
        sprite2d.getPosition().x + (this.left ? -0.1 : (this.right ? 0.1 : 0)),
        sprite2d.getPosition().y + (this.up ? 0.1 : (this.down ? -0.1 : 0)),
        sprite2d.getPosition().z
      );

      this.mouseLeft = mouse.isPressed(PlayCanvas.MOUSEBUTTON_LEFT);
      this.mouseRight = mouse.isPressed(PlayCanvas.MOUSEBUTTON_RIGHT);
      this.mouseMiddle = mouse.isPressed(PlayCanvas.MOUSEBUTTON_MIDDLE);

      // ゲームパッドは情報の更新が必要
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

engine.createScript('boxRotate').extend({
  initialize () {
  },
  postInitialize () {
  },
  update (dt) {
    this.entity.rotate(10 * dt, 20 * dt, 30 * dt);
  },
  postUpdate () {
  },
  swap (old) {
  },
});

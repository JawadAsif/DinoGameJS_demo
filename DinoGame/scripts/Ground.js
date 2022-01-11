//this class is useless it just shows some dots on the ground

class Ground {
  constructor() {
    this.posX = width;
    this.posY = height - floor(random(groundHeight - 20 * scl, groundHeight + 30 * scl));
    this.w = floor(random(1, 10));
  }

  show() {
    stroke(0);
    strokeWeight(3);
    line(this.posX, this.posY, this.posX + this.w, this.posY);
  }
  move(speed) {
    this.posX -= speed;
  }
}
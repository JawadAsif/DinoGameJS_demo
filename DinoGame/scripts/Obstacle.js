class Obstacle {

  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //constructor
  constructor(t) {
    this.w;
    this.h;
    this.posX = width;
    this.type = t;
    switch (this.type) {
      case 0://small cactus
        this.w = 40 * scl;
        this.h = 80 * scl;
        break;
      case 1://big cactus
        this.w = 60 * scl;
        this.h = 120 * scl;
        break;
      case 2://small cacti
        this.w = 120 * scl;
        this.h = 80 * scl;
        break;
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //show the cactus
  show() {
    fill(0);
    rectMode(CENTER);
    switch (this.type) {
      case 0:
        image(smallCactus, this.posX - smallCactus.width / 2 * scl, height - groundHeight - smallCactus.height * scl, this.w, this.h);
        break;
      case 1:
        image(bigCactus, this.posX - bigCactus.width / 2 * scl, height - groundHeight - bigCactus.height * scl, this.w, this.h);
        break;
      case 2:
        image(manySmallCactus, this.posX - manySmallCactus.width / 2 * scl, height - groundHeight - manySmallCactus.height * scl, this.w, this.h);
        break;
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------
  // move the obstacle
  move(speed) {
    this.posX -= speed;
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns whether or not the player collides with this obstacle
  collided(playerX, playerY, playerWidth, playerHeight) {

    var playerLeft = playerX - playerWidth / 2;
    var playerRight = playerX + playerWidth / 2;
    var thisLeft = this.posX - this.w / 2;
    var thisRight = this.posX + this.w / 2;

    if ((playerLeft <= thisRight && playerRight >= thisLeft) || (thisLeft <= playerRight && thisRight >= playerLeft)) {
      var playerDown = playerY - playerHeight / 2;
      var thisUp = this.h;
      if (playerDown <= thisUp) {
        return true;
      }
    }
    return false;
  }
}
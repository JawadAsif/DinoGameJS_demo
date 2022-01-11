class Bird {
  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //constructor
  constructor(type) {
    this.w = 60 * scl;
    this.h = 50 * scl;
    this.posY;
    this.flapCount = 0;
    this.posX = width;
    this.typeOfBird = type;
    switch (type) {
      case 0://flying low
        this.posY = 10 + this.h / 2 * scl;
        break;
      case 1://flying middle
        this.posY = 100 * scl;
        break;
      case 2://flying high
        this.posY = 180 * scl;
        break;
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //show the birf
  show() {
    this.flapCount++;

    if (this.flapCount < 0) {//flap the berd
      image(bird, this.posX - bird.width * scl / 2, height - groundHeight - (this.posY + bird.height * scl) - 20 * scl, bird.width * scl, bird.height * scl);
    } else {
      image(bird1, this.posX - bird1.width * scl / 2, height - groundHeight - (this.posY + bird1.height * scl) - 20 * scl, bird1.width * scl, bird1.height * scl);
    }
    if (this.flapCount > 15) {
      this.flapCount = -15;

    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //move the bard
  move(speed) {
    this.posX -= speed;
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns whether or not the bird collides with the player
  collided(playerX, playerY, playerWidth, playerHeight) {

    var playerLeft = playerX - playerWidth / 2;
    var playerRight = playerX + playerWidth / 2;
    var thisLeft = this.posX - this.w / 2;
    var thisRight = this.posX + this.w / 2;

    if ((playerLeft <= thisRight && playerRight >= thisLeft) || (thisLeft <= playerRight && thisRight >= playerLeft)) {
      var playerUp = playerY + playerHeight / 2;
      var playerDown = playerY - playerHeight / 2;
      var thisUp = this.posY + this.h / 2;
      var thisDown = this.posY - this.h / 2;
      if (playerDown <= thisUp && playerUp >= thisDown) {
        return true;
      }
    }
    return false;
  }
}
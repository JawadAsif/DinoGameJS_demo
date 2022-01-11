class Player {
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //constructor

  constructor() {
    this.fitness = 0;
    this.brain;
    this.replay = false;

    this.unadjustedFitness;
    this.lifespan = 0;//how long the player lived for fitness
    this.bestScore = 0;//stores the score achieved used for replay
    this.dead;
    this.score = 0;
    this.gen = 0;

    this.genomeInputs = 7;
    this.genomeOutputs = 3;

    this.vision = [];//the input array fed into the neuralNet 
    this.decision = []; //the out put of the NN 
    this.posY = 0;
    this.velY = 0;
    this.gravity = playerDefaultGravity;
    this.runCount = -5;
    this.size = playerSize;

    this.replayObstacles = [];
    this.replayBirds = [];
    this.localObstacleHistory = [];
    this.localRandomAdditionHistory = [];
    this.historyCounter = 0;
    this.localObstacleTimer = 0;
    this.localSpeed = default_speed;
    this.localSpeedIncrement = speedIncrement;
    this.localRandomAddition = 0;

    this.duck = false;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
  }

  fromJSON(obj) {
    this.fitness = obj.fitness;
    this.replay = obj.replay;

    this.unadjustedFitness = obj.unadjustedFitness;
    this.lifespan = obj.lifespan;//how long the player lived for fitness
    this.bestScore = obj.bestScore;//stores the score achieved used for replay
    this.dead = obj.dead;
    this.score = obj.score;
    this.gen = obj.gen;

    this.genomeInputs = obj.genomeInputs;
    this.genomeOutputs = obj.genomeOutputs;

    arrayCopy(obj.vision, this.vision)//the input array fed into the neuralNet 
    arrayCopy(obj.decision, this.decision); //the out put of the NN 
    this.posY = obj.posY;
    this.velY = obj.velY;
    this.gravity = obj.gravity;
    this.runCount = obj.gravity;
    this.size = obj.size;

    arrayCopy(obj.replayObstacles, this.replayObstacles);
    arrayCopy(obj.replayBirds, this.replayBirds);
    arrayCopy(obj.localObstacleHistory, this.localObstacleHistory);
    arrayCopy(obj.localRandomAdditionHistory, this.localRandomAdditionHistory);
    this.historyCounter = obj.historyCounter;
    this.localObstacleTimer = obj.localObstacleTimer;
    this.localSpeed = obj.localSpeed;
    this.localSpeedIncrement = obj.localSpeedIncrement;
    this.localRandomAddition = obj.localRandomAddition;

    this.duck = obj.duck;
    this.brain = new Genome().fromJSON(obj.brain);
    return this;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //show the dino
  show() {
    if (this.duck && this.posY == 0) {
      if (this.runCount < 0) {

        image(dinoDuck, playerXpos - dinoDuck.width / 2 * scl, height - groundHeight - (this.posY + dinoDuck.height * scl), dinoDuck.width * scl, dinoDuck.height * scl);
      } else {

        image(dinoDuck1, playerXpos - dinoDuck1.width / 2 * scl, height - groundHeight - (this.posY + dinoDuck1.height * scl), dinoDuck1.width * scl, dinoDuck1.height * scl);
      }
    } else
      if (this.posY == 0) {
        if (this.runCount < 0) {
          image(dinoRun1, playerXpos - dinoRun1.width / 2 * scl, height - groundHeight - (this.posY + dinoRun1.height * scl), dinoRun1.width * scl, dinoRun1.height * scl);
        } else {
          image(dinoRun2, playerXpos - dinoRun2.width / 2 * scl, height - groundHeight - (this.posY + dinoRun2.height * scl), dinoRun2.width * scl, dinoRun2.height * scl);
        }
      } else {
        image(dinoJump, playerXpos - dinoJump.width / 2 * scl, height - groundHeight - (this.posY + dinoJump.height * scl), dinoJump.width * scl, dinoJump.height * scl);
      }
    this.runCount++;
    if (this.runCount > 5) {
      this.runCount = -5;
    }
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------

  incrementCounters() {
    this.lifespan++;
    if (this.lifespan % 3 == 0) {
      this.score += 1;
    }
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //checks for collisions and if this is a replay move all the obstacles
  move() {
    this.posY += this.velY;
    if (this.posY > 0) {
      this.velY -= this.gravity;
    } else {
      this.velY = 0;
      this.posY = 0;
    }

    if (!this.replay) {

      for (var i = 0; i < obstacles.length; i++) {
        if (this.posY == 0) {
          if (obstacles[i].collided(playerXpos, this.posY + dinoRun1.height / 2 * scl, dinoRun1.width * 0.5 * scl, dinoRun1.height * scl)) {
            this.dead = true;
          }
        } else {
          if (obstacles[i].collided(playerXpos, this.posY + dinoJump.height / 2 * scl, dinoJump.width * 0.5 * scl, dinoJump.height * scl)) {
            this.dead = true;
          }
        }

      }

      for (var i = 0; i < birds.length; i++) {
        if (this.duck && this.posY == 0) {
          if (birds[i].collided(playerXpos, this.posY + dinoDuck.height / 2 * scl, dinoDuck.width * 0.8 * scl, dinoDuck.height * scl)) {
            this.dead = true;
          }
        } else {
          if (birds[i].collided(playerXpos, this.posY + dinoRun1.height / 2 * scl, dinoRun1.width * 0.5 * scl, dinoRun1.height * scl)) {
            this.dead = true;
          }
        }
      }
    } else {//if replayign then move local obstacles
      for (var i = 0; i < this.replayObstacles.length; i++) {
        if (this.posY == 0) {
          if (this.replayObstacles[i].collided(playerXpos, this.posY + dinoRun1.height / 2 * scl, dinoRun1.width * 0.5 * scl, dinoRun1.height * scl)) {
            this.dead = true;
          }
        } else {
          if (this.replayObstacles[i].collided(playerXpos, this.posY + dinoJump.height / 2 * scl, dinoJump.width * 0.5 * scl, dinoRun1.height * scl)) {
            this.dead = true;
          }
        }
      }
    }


    for (var i = 0; i < this.replayBirds.length; i++) {
      if (this.duck && this.posY == 0) {
        if (this.replayBirds[i].collided(playerXpos, this.posY + dinoDuck.height / 2 * scl, dinoDuck.width * 0.8 * scl, dinoDuck.height * scl)) {
          this.dead = true;
        }
      } else {
        if (this.replayBirds[i].collided(playerXpos, this.posY + dinoRun1.height / 2 * scl, dinoRun1.width * 0.5 * scl, dinoRun1.height * scl)) {
          this.dead = true;
        }
      }
    }
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //what could this do????
  jump(bigJump) {
    // console.log(this.decision);
    if (this.posY == 0) {
      if (bigJump) {
        this.gravity = bigJumpGravity;
        this.velY = highJumpY;
      } else {
        this.gravity = smallJumpGravity;
        this.velY = lowJumpY;
      }
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //if parameter is true and is in the air increase gravity
  ducking(isDucking) {
    if (this.posY != 0 && isDucking) {
      this.gravity = duckGravity;
    }
    this.duck = isDucking;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //called every frame
  update() {
    this.incrementCounters();
    this.move();
  }
  //----------------------------------------------------------------------------------------------------------------------------------------------------------
  //get inputs for Neural network
  look() {
    if (!this.replay) {
      var temp = 0;
      var min = 10000;
      var minIndex = -1;
      var berd = false;
      for (var i = 0; i < obstacles.length; i++) {
        if (obstacles[i].posX + obstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && obstacles[i].posX + obstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {
          //if the distance between the left of the player and the right of the obstacle is the least
          min = obstacles[i].posX + obstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
          minIndex = i;
        }
      }

      for (var i = 0; i < birds.length; i++) {
        if (birds[i].posX + birds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && birds[i].posX + birds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
          min = birds[i].posX + birds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
          minIndex = i;
          berd = true;
        }
      }
      this.vision[4] = speed;
      this.vision[5] = this.posY;


      if (minIndex == -1) {//if there are no obstacles
        this.vision[0] = 0;
        this.vision[1] = 0;
        this.vision[2] = 0;
        this.vision[3] = 0;
        this.vision[6] = 0;
      } else {

        this.vision[0] = 1.0 / (min / 10.0); //distance to next obstacle
        if (berd) {
          this.vision[1] = birds[minIndex].h; //height of obstacle
          this.vision[2] = birds[minIndex].w; //width of obstacle
          if (birds[minIndex].typeOfBird == 0) {
            this.vision[3] = 0; // bird height
          } else {
            this.vision[3] = birds[minIndex].posY; // bird height
          }
        } else {
          this.vision[1] = obstacles[minIndex].h; // height of next obstacle
          this.vision[2] = obstacles[minIndex].w; // width of next obstacle
          this.vision[3] = 0; //bird height
        }




        //vision 6 is the gap between the this obstacle and the next one
        var bestIndex = minIndex;
        var closestDist = min;
        min = 10000;
        minIndex = -1;
        for (var i = 0; i < obstacles.length; i++) {
          if ((berd || i != bestIndex) && obstacles[i].posX + obstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && obstacles[i].posX + obstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
            min = obstacles[i].posX + obstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
            minIndex = i;
          }
        }

        for (var i = 0; i < birds.length; i++) {
          if ((!berd || i != bestIndex) && birds[i].posX + birds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && birds[i].posX + birds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
            min = birds[i].posX + birds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
            minIndex = i;
          }
        }

        if (minIndex == -1) {//if there is only one obejct on the screen
          this.vision[6] = 0; //gap between obstacles
        } else {
          this.vision[6] = 1 / (min - closestDist); //gap between obstacles
        }
      }
    } else {//if replaying then use local shit
      temp = 0;
      min = 10000;
      minIndex = -1;
      berd = false;
      for (var i = 0; i < this.replayObstacles.length; i++) {
        if (this.replayObstacles[i].posX + this.replayObstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && this.replayObstacles[i].posX + this.replayObstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
          min = this.replayObstacles[i].posX + this.replayObstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
          minIndex = i;
        }
      }

      for (var i = 0; i < this.replayBirds.length; i++) {
        if (this.replayBirds[i].posX + this.replayBirds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && this.replayBirds[i].posX + this.replayBirds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
          min = this.replayBirds[i].posX + this.replayBirds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
          minIndex = i;
          berd = true;
        }
      }
      this.vision[4] = this.localSpeed;
      this.vision[5] = this.posY;


      if (minIndex == -1) {//if there are no replayObstacles
        this.vision[0] = 0;
        this.vision[1] = 0;
        this.vision[2] = 0;
        this.vision[3] = 0;
        this.vision[6] = 0;
      } else {

        this.vision[0] = 1.0 / (min / 10.0);
        if (berd) {
          this.vision[1] = this.replayBirds[minIndex].h;
          this.vision[2] = this.replayBirds[minIndex].w;
          if (this.replayBirds[minIndex].typeOfBird == 0) {
            this.vision[3] = 0;
          } else {
            this.vision[3] = this.replayBirds[minIndex].posY;
          }
        } else {
          this.vision[1] = this.replayObstacles[minIndex].h;
          this.vision[2] = this.replayObstacles[minIndex].w;
          this.vision[3] = 0;
        }




        //vision 6 is the gap between the this obstacle and the next one
        bestIndex = minIndex;
        closestDist = min;
        min = 10000;
        minIndex = -1;
        for (var i = 0; i < this.replayObstacles.length; i++) {
          if ((berd || i != bestIndex) && this.replayObstacles[i].posX + this.replayObstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && this.replayObstacles[i].posX + this.replayObstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
            min = this.replayObstacles[i].posX + this.replayObstacles[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
            minIndex = i;
          }
        }

        for (var i = 0; i < this.replayBirds.length; i++) {
          if ((!berd || i != bestIndex) && this.replayBirds[i].posX + this.replayBirds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) < min && this.replayBirds[i].posX + this.replayBirds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl) > 0) {//if the distance between the left of the player and the right of the obstacle is the least
            min = this.replayBirds[i].posX + this.replayBirds[i].w / 2 - (playerXpos - dinoRun1.width / 2 * scl);
            minIndex = i;
          }
        }

        if (minIndex == -1) {//if there is only one obejct on the screen
          this.vision[6] = 0;
        } else {
          this.vision[6] = 1 / (min - closestDist);
        }
      }
    }
  }






  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the brain then converts them to actions
  think() {

    var max = 0;
    var maxIndex = 0;
    //get the output of the neural network
    this.decision = this.brain.feedForward(this.vision);

    for (var i = 0; i < this.decision.length; i++) {
      if (this.decision[i] > max) {
        max = this.decision[i];
        maxIndex = i;
      }
    }

    if (max < 0.7) {
      this.ducking(false);
      return;
    }

    switch (maxIndex) {
      case 0:
        this.jump(false);
        break;
      case 1:
        this.jump(true);
        break;
      case 2:
        this.ducking(true);
        break;
    }
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------  
  //returns a clone of this player with the same brian
  clone() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
  //this fuction does that

  cloneForReplay() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    clone.replay = true;
    if (this.replay) {
      arrayCopy(this.localObstacleHistory, clone.localObstacleHistory);
      arrayCopy(this.localRandomAdditionHistory, clone.localRandomAdditionHistory);
    } else {
      // clone.localObstacleHistory = obstacleHistory.clone();
      arrayCopy(obstacleHistory, clone.localObstacleHistory);
      // clone.localRandomAdditionHistory = randomAdditionHistory.clone();
      arrayCopy(randomAdditionHistory, clone.localRandomAdditionHistory);
    }

    return clone;
  }

  cloneForJSON() {
    var clone = new Player();

    clone.fitness = this.fitness;
    clone.replay = this.replay;
    clone.unadjustedFitness = this.unadjustedFitness;
    clone.lifespan = this.lifespan;
    clone.bestScore = this.bestscore;
    clone.dead = this.dead;
    clone.score = this.score;
    clone.gen = this.gen;

    clone.genomeInputs = this.genomeInputs;
    clone.genomeOutputs = this.genomeOutputs;

    arrayCopy(this.vision, clone.vision);
    arrayCopy(this.decision, clone.decision);
    clone.posY = this.posY;
    clone.velY = this.velY;
    clone.gravity = this.gravity;
    clone.runCount = this.runCount;
    clone.size = this.size;

    arrayCopy(this.replayObstacles, clone.replayObstacles);
    arrayCopy(this.replayBirds, clone.replayBirds);
    if (this.replay) {
      arrayCopy(this.localObstacleHistory, clone.localObstacleHistory);
      arrayCopy(this.localRandomAdditionHistory, clone.localRandomAdditionHistory);
    } else {
      // clone.localObstacleHistory = obstacleHistory.clone();
      arrayCopy(obstacleHistory, clone.localObstacleHistory);
      // clone.localRandomAdditionHistory = randomAdditionHistory.clone();
      arrayCopy(randomAdditionHistory, clone.localRandomAdditionHistory);
    }
    clone.historyCounter = this.historyCounter;
    clone.localObstacleTimer = this.localObstacleTimer;
    clone.localSpeed = this.localSpeed;
    clone.localSpeedIncrement = this.localSpeedIncrement;
    clone.localRandomAddition = this.localRandomAddition;

    clone.duck = this.duck;
    clone.brain = this.brain.cloneForJSON();

    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    this.fitness = this.score * this.score;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  crossover(parent2) {
    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }
  //--------------------------------------------------------------------------------------------------------------------------------------------------------
  //if replaying then the dino has local obstacles
  updateLocalObstacles() {
    this.localObstacleTimer++;
    this.localSpeed += this.localSpeedIncrement;
    if (this.historyCounter >= this.localRandomAdditionHistory.length) {
      this.historyCounter = 0;
    } else {
      this.localRandomAddition = this.localRandomAdditionHistory[this.historyCounter];
    }
    if (this.localObstacleTimer > minimumTimeBetweenObstacles + this.localRandomAddition) {
      this.addLocalObstacle();
    }
    groundCounter++;
    if (groundCounter > 10) {
      groundCounter = 0;
      grounds.push(new Ground());
    }

    this.moveLocalObstacles();
    this.showLocalObstacles();
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  moveLocalObstacles() {
    for (var i = 0; i < this.replayObstacles.length; i++) {
      this.replayObstacles[i].move(this.localSpeed);
      if (this.replayObstacles[i].posX < -100) {
        this.replayObstacles.splice(i, 1);
        i--;
      }
    }

    for (var i = 0; i < this.replayBirds.length; i++) {
      this.replayBirds[i].move(this.localSpeed);
      if (this.replayBirds[i].posX < -100) {
        this.replayBirds.splice(i, 1);
        i--;
      }
    }
    for (var i = 0; i < grounds.length; i++) {
      grounds[i].move(this.localSpeed);
      if (grounds[i].posX < -100) {
        grounds.splice(i, 1);
        i--;
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------------
  addLocalObstacle() {
    var tempInt = this.localObstacleHistory[this.historyCounter];
    this.historyCounter++;
    if (tempInt < 3) {
      this.replayBirds.push(new Bird(tempInt));
    } else {
      this.replayObstacles.push(new Obstacle(tempInt - 3));
    }
    this.localObstacleTimer = 0;
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  showLocalObstacles() {
    for (var i = 0; i < grounds.length; i++) {
      grounds[i].show();
    }
    for (var i = 0; i < this.replayObstacles.length; i++) {
      this.replayObstacles[i].show();
    }

    for (var i = 0; i < this.replayBirds.length; i++) {
      this.replayBirds[i].show();
    }
  }
}
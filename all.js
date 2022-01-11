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
//a connection between 2 nodes
class connectionGene {
  constructor(from, to, w, inno) {
    this.fromNode = from;
    this.toNode = to;
    this.weight = w;
    this.enabled = true;
    this.innovationNo = inno;

  }

  fromJSON(obj) {
    this.fromNode = new Node().fromJSON(obj.fromNode);
    this.toNode = new Node().fromJSON(obj.toNode);
    this.weight = obj.weight;
    this.enabled = obj.enabled;
    this.innovationNo = obj.innovationNo;
    return this;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //changes the weight
  mutateWeight() {
    var rand2 = random(1);
    if (rand2 < 0.1) {//10% of the time completely change the weight
      this.weight = random(-1, 1);
    } else {//otherwise slightly change it
      this.weight += randomGaussian() / 50;
      //keep weight between bounds
      if (this.weight > 1) {
        this.weight = 1;
      }
      if (this.weight < -1) {
        this.weight = -1;

      }
    }
  }

  //----------------------------------------------------------------------------------------------------------
  //returns a copy of this connectionGene
  clone(from, to) {
    var clone = new connectionGene(from, to, this.weight, this.innovationNo);
    clone.enabled = this.enabled;

    return clone;
  }

  cloneForJSON(from, to) {
    from = from.cloneForJSON();
    to = to.cloneForJSON();
    var clone = new connectionGene(from, to, this.weight, this.innovationNo);
    clone.enabled = this.enabled;

    return clone;
  }
}
class connectionHistory {

  constructor(from, to, inno, innovationNos) {
    this.fromNode = from;
    this.toNode = to;
    this.innovationNumber = inno;
    this.innovationNumbers = [];
    if (innovationNos.length > 0) {
      arrayCopy(innovationNos, this.innovationNumbers);
    }
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns whether the genome matches the original genome and the connection is between the same nodes
  matches(genome, from, to) {
    if (genome.genes.length === this.innovationNumbers.length) { //if the number of connections are different then the genoemes aren't the same
      if (from.number === this.fromNode && to.number === this.toNode) {
        //next check if all the innovation numbers match from the genome
        for (var i = 0; i < genome.genes.length; i++) {
          if (!this.innovationNumbers.includes(genome.genes[i].innovationNo)) {
            return false;
          }
        }

        //if reached this far then the innovationNumbers match the genes innovation numbers and the connection is between the same nodes
        //so it does match
        return true;
      }
    }
    return false;
  }
}
// const { load } = require("libraries/p5");

//Globals
var nextConnectionNo = 1000;
var population;
var scl = .5;
var frameSpeed = 60;


// variable set from outside
// var showBestEachGen = true;
var loadGenFromFile = false;
var upToGen = 0;
var genPlayerTemp;
// var stage = 0;
var showNothing = false;


//images
var dinoRun1;
var dinoRun2;
var dinoJump;
var dinoDuck;
var dinoDuck1;
var smallCactus;
var manySmallCactus;
var bigCactus;
var bird;
var bird1;


var obstacles = [];
var birds = [];
var grounds = [];


var obstacleTimer = 0;
var minimumTimeBetweenObstacles = 90;
var randomAddition = 0;
var groundCounter = 0;
const speed_scl = scl;
const default_speed = 10 * speed_scl;
var speed = default_speed;
const speedIncrement = 0.002;
const smallJumpGravity = 1.2 * scl;
const bigJumpGravity = 1 * scl;
const duckGravity = 3 * scl;
const playerDefaultGravity = 1.2 * scl;
const highJumpY = 20 * scl;
const lowJumpY = 16 * scl;
const playerSize = 20 * scl;

var groundHeight = 300 * scl;
var playerXpos = 150 * scl;

var obstacleHistory = [];
var randomAdditionHistory = [];
var loadedBestsFromJson;
var loadedGenFromJSON;

var writeInfoX = 400 * scl;
var writeInfoPadding = 20 * scl;
var brainWidth = 400 * scl;
var brainHeight = 350 * scl;

var cWidth;
var cHeight;

var fontRegular, fontBold, fontExtraBold, fontLight, fontMedium, fontSemiBold, fontItalic;

const error = new Error("Should not end here")
error.code = "101";

//--------------------------------------------------------------------------------------------------------------------------------------------------
function preload() {
  // if (showBestEachGen) {
  //   loadedBestsFromJson = loadJSON("DinoGame/examples/bestplayers.json");
  // }
  // if (loadGenFromFile) {
  //   loadedGenFromJSON = loadJSON("DinoGame/examples/population (2).json");
  // }
  // console.log(loadedJSON);
  fontRegular = loadFont('../fonts/Raleway-Regular.ttf');
  fontItalic = loadFont('../fonts/Raleway-Italic.ttf');
}


function setup() {
  cWidth = windowWidth;
  cHeight = windowHeight-235;
  // console.log(loadedJSON);
  frameRate(60);
  var canvas = createCanvas(cWidth, cHeight);
  canvas.style('display', 'block');
  canvas.parent('pt');
  // window.canvas = canvas;
  // canvas.parent("canvas");
  // console.log(document.getElementById("main").style.marginLeft, windowHeight);
  dinoRun1 = loadImage("DinoGame/data/dinorun0000.png");
  dinoRun2 = loadImage("DinoGame/data/dinorun0001.png");
  dinoJump = loadImage("DinoGame/data/dinoJump0000.png");
  dinoDuck = loadImage("DinoGame/data/dinoduck0000.png");
  dinoDuck1 = loadImage("DinoGame/data/dinoduck0001.png");

  smallCactus = loadImage("DinoGame/data/cactusSmall0000.png");
  bigCactus = loadImage("DinoGame/data/cactusBig0000.png");
  manySmallCactus = loadImage("DinoGame/data/cactusSmallMany0000.png");
  bird = loadImage("DinoGame/data/berd.png");
  bird1 = loadImage("DinoGame/data/berd2.png");

  population = new Population(0); //<<number of dinosaurs in each generation

  if (showBestEachGen) {
    population.genPlayers = [];
    for (var key in loadedBestsFromJson) {
      var player = new Player().fromJSON(loadedBestsFromJson[key]);
      population.genPlayers.push(player);
    }
    upToGen = 0;
    genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
  }
  else {
    if (loadGenFromFile) {
      population = population.fromJSON(loadedGenFromJSON);
    }
    else {
      population = new Population(500); //<<number of dinosaurs in each generation
    }
  }

}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function windowResized() {
  cWidth = windowWidth;
  cHeight = windowHeight-235;
  resizeCanvas(cWidth, cHeight);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {
  drawToScreen();
  if (showBestEachGen) {//show the best of each gen
    showBestPlayersForEachGeneration();
  } else {//if just evolving normally
    if (!population.done()) {//if any players are alive then update them
      updateObstacles();
      population.updateAlive();
    } else {//all dead
      //genetic algorithm 
      // stage = 0;
      population.naturalSelection();
      resetObstacles();
    }
  }
}

function touchEnded() {
  return true;
}

//-----------------------------------------------------------------------------------
function showBestPlayersForEachGeneration() {
  if (!genPlayerTemp.dead) {//if current gen player is not dead then update it
    genPlayerTemp.updateLocalObstacles();
    genPlayerTemp.look();
    genPlayerTemp.think();
    genPlayerTemp.update();
    genPlayerTemp.show();
  } else {//if dead move on to the next generation
    upToGen++;
    var isMobile = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      isMobile = true;
    }
    if (upToGen >= population.genPlayers.length
      || (isMobile && genPlayerTemp.gen == 12) //for small devices
    ) {//if at the end then return to the start and stop doing it
      upToGen = 0;
      genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
      // showBestEachGen = false;
    } else {//if not at the end then get the next generation
      genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
    }
  }
}
//-----------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------------------------------------------------
//draws the display screen
function drawToScreen() {
  if (!showNothing) {
    if (cWidth > 800) {
      groundHeight = 300 * scl;
    }
    else if (cWidth > 600) {
      groundHeight = 250 * scl;
    }
    else {
      groundHeight = 200 * scl;
    }
    background(255);
    stroke(0);
    strokeWeight(2);
    line(0, height - groundHeight - 30 * scl, width, height - groundHeight - 30 * scl); // ground
    drawBrain();
    writeInfo();
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function drawBrain() {  //show the brain of whatever genome is currently showing
  var startX = (cWidth - brainWidth) / 2;
  var startY = writeInfoPadding;
  var w = brainWidth;
  var h = brainHeight;
  startY += 50;
  if (showBestEachGen) {
    genPlayerTemp.brain.drawGenome(startX, startY, w, h);
  } else {
    for (var i = 0; i < population.pop.length; i++) {
      if (!population.pop[i].dead) {
        population.pop[i].brain.drawGenome(startX, startY, w, h);
        break;
      }
    }
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//writes info about the current player
function writeInfo() {
  noStroke();
  if (showBestEachGen) { //if showing the best for each gen then write the applicable info
    if (cWidth > 800) {
      textSize(18);

      textFont(fontRegular);
      textAlign(LEFT);
      fill('#1B242F');
      text("Score: ", 30, height - 30);

      fill('#036367');
      text(genPlayerTemp.score, 90, height - 30);

      //text(, width/2-180, height-30);
      textAlign(CENTER);
      // text("Teaching Dino to play automatically using Artificial Intelligence", width / 2, height - 50);
      fill('#1B242F');
      text("Teaching 'Dino' to play automatically using ", width / 2 - 88, height - 30);
      textFont(fontItalic);
      fill('#036367');
      text("Artificial Intelligence", width / 2 + 178, height - 30);

      textFont(fontRegular);
      textAlign(RIGHT);
      fill('#1B242F');
      text("Gen: ", width - 55, height - 30);
      fill('#036367');
      text((genPlayerTemp.gen + 1), width - 30, height - 30);
    }
    else {
      textSize(14);

      textFont(fontRegular);
      textAlign(LEFT);
      fill('#1B242F');
      text("S: ", 15, height - 25);

      fill('#036367');
      text(genPlayerTemp.score, 30, height - 25);

      //text(, width/2-180, height-30);
      fill('#1B242F');
      textAlign(CENTER);
      // text("Teaching Dino to play automatically using", width / 2, height - 50);
      textFont(fontRegular);
      text("Teaching 'Dino' to play automatically using ", width / 2, height - 50);
      textFont(fontItalic);
      fill('#036367');
      text("Artificial Intelligence", width / 2, height - 30);

      textFont(fontRegular);
      textAlign(RIGHT);
      fill('#1B242F');
      text("G: ", width - 25, height - 25);
      fill('#036367');
      text((genPlayerTemp.gen + 1), width - 15, height - 25);
    }
    textSize(15);
    // var x = writeInfoX - writeInfoPadding / 2;
    // var y = writeInfoPadding + 5;
    // text("Next Obstacle", x, y + 44.44444);
    // text("Height of obstacle", x, y + 2 * 44.44444);
    // text("Width of obstacle", x, y + 3 * 44.44444);
    // text("Bird height", x, y + 4 * 44.44444);
    // text("Speed", x, y + 5 * 44.44444);
    // text("Players Y position", x, y + 6 * 44.44444);
    // text("Gap between obstacles", x, y + 7 * 44.44444);
    // text("Bias", x, y + 8 * 44.44444);

    // textAlign(LEFT);
    // var outputx = writeInfoX + writeInfoPadding + brainWidth + writeInfoPadding / 2;
    // text("Small Jump", outputx, 125);
    // text("Big Jump", outputx, 225);
    // text("Duck", outputx, 325);
  } else { //evolving normally 
    if (cWidth > 800) {
      textSize(18);

      textFont(fontRegular);
      textAlign(LEFT);
      fill('#1B242F');
      text("Score: ", 30, height - 30);

      fill('#036367');
      text(floor(population.populationLife / 3.0), 90, height - 30);


      //text(, width/2-180, height-30);
      textAlign(CENTER);
      // text("Teaching Dino to play automatically using Artificial Intelligence", width / 2, height - 50);
      fill('#1B242F');
      text("Teaching 'Dino' to play automatically using ", width / 2 - 88, height - 30);
      textFont(fontItalic);
      fill('#036367');
      text("Artificial Intelligence", width / 2 + 178, height - 30);

      textFont(fontRegular);
      textAlign(RIGHT);
      fill('#1B242F');
      text("Gen: ", width - 55, height - 30);
      fill('#036367');
      text((population.gen + 1), width - 30, height - 30);
    }
    else {
      textSize(14);

      textFont(fontRegular);
      textAlign(LEFT);
      fill('#1B242F');
      text("S: ", 15, height - 25);

      fill('#036367');
      text(floor(population.populationLife / 3.0), 30, height - 25);

      //text(, width/2-180, height-30);
      fill('#1B242F');
      textAlign(CENTER);
      // text("Teaching Dino to play automatically using", width / 2, height - 50);
      textFont(fontRegular);
      text("Teaching 'Dino' to play automatically using ", width / 2, height - 50);
      textFont(fontItalic);
      fill('#036367');
      text("Artificial Intelligence", width / 2, height - 30);

      textFont(fontRegular);
      textAlign(RIGHT);
      fill('#1B242F');
      text("G: ", width - 25, height - 25);
      fill('#036367');
      text((population.gen + 1), width - 15, height - 25);
    }
    textSize(15);
    // text("Distace to next obstacle", x, 18 + 44.44444);
    // text("Height of obstacle", x, 18 + 2 * 44.44444);
    // text("Width of obstacle", x, 18 + 3 * 44.44444);
    // text("Bird height", x, 18 + 4 * 44.44444);
    // text("Speed", x, 18 + 5 * 44.44444);
    // text("Players Y position", x, 18 + 6 * 44.44444);
    // text("Gap between obstacles", x, 18 + 7 * 44.44444);
    // text("Bias", x, 18 + 8 * 44.44444);

    // textAlign(LEFT);
    // text("Small Jump", 820, 118);
    // text("Big Jump", 820, 218);
    // text("Duck", 820, 318);
  }
}


//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (keyCode) {
    // case 107://speed up frame rate
    //   frameSpeed += 10;
    //   frameRate(frameSpeed);
    //   console.log(frameSpeed);
    //   break;
    // case 109://slow down frame rate
    //   if (frameSpeed > 10) {
    //     frameSpeed -= 10;
    //     frameRate(frameSpeed);
    //     console.log(frameSpeed);
    //   }
    //   break;
    // case 71://show generations 'g'
    //   showBestEachGen = !showBestEachGen;
    //   upToGen = 0;
    //   genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
    //   break;
    // case 65:
    //   population.saveBests();
    //   break;
    // case 83:
    //   population.savePopulation();
    //   break;
    // case 78://'n' -show absolutely nothing in order to speed up computation
    //   showNothing = !showNothing;
    //   break;
    case RIGHT_ARROW://any of the arrow keys
      if (showBestEachGen) {//if showing the best player each generation then move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) {//if reached the current generation then exit out of the showing generations mode
          upToGen = 0;
        }
        genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
      }
      break;
    case LEFT_ARROW://any of the arrow keys
      if (showBestEachGen) {//if showing the best player each generation then move on to the next generation
        upToGen--;
        if (upToGen < 0) {//if reached the current generation then exit out of the showing generations mode
          upToGen = population.genPlayers.length - 1;
        }
        genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
      }
      break;
  }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//called every frame
function updateObstacles() {
  obstacleTimer++;
  speed += speedIncrement;
  if (obstacleTimer > minimumTimeBetweenObstacles + randomAddition) { //if the obstacle timer is high enough then add a new obstacle
    addObstacle();
  }
  groundCounter++;
  if (groundCounter > 10) { //every 10 frames add a ground bit
    groundCounter = 0;
    grounds.push(new Ground());
  }

  moveObstacles();//move everything
  if (!showNothing) {//show everything
    showObstacles();
  }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//moves obstacles to the left based on the speed of the game 
function moveObstacles() {
  // console.log(speed);
  for (var i = 0; i < obstacles.length; i++) {
    obstacles[i].move(speed);
    if (obstacles[i].posX < -playerXpos) {
      obstacles.splice(i, 1);
      i--;
    }
  }

  for (var i = 0; i < birds.length; i++) {
    birds[i].move(speed);
    if (birds[i].posX < -playerXpos) {
      birds.splice(i, 1);
      i--;
    }
  }
  for (var i = 0; i < grounds.length; i++) {
    grounds[i].move(speed);
    if (grounds[i].posX < -playerXpos) {
      grounds.splice(i, 1);
      i--;
    }
  }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------
//every so often add an obstacle 
function addObstacle() {
  var lifespan = population.populationLife;
  var tempInt;
  // if (lifespan > (stage + 1) * 900) {
  //   stage++;
  // }
  // if (stage > 3) {
  //   stage = 3;
  // }

  // if (stage == 3) {
  //   if (random(1) < 0.20) { // 20% of the time add a bird
  //     tempInt = floor(random(3));
  //     var temp = new Bird(tempInt);//floor(random(3)));
  //     birds.push(temp);
  //   } else {
  //     tempInt = floor(random(3));
  //     var temp = new Obstacle(tempInt);//floor(random(3)));
  //     obstacles.push(temp);
  //     tempInt += 3;
  //   }
  // }
  // else if (stage == 2) {
  //   tempInt = floor(random(3));
  //   var temp = new Obstacle(tempInt);//floor(random(3)));
  //   obstacles.push(temp);
  //   tempInt += 3;
  // }
  // else if (stage == 1) {
  //   tempInt = floor(random(2));
  //   var temp = new Obstacle(tempInt);//floor(random(3)));
  //   obstacles.push(temp);
  //   tempInt += 3;
  // }
  // else {
  //   tempInt = floor(random(1));
  //   var temp = new Obstacle(tempInt);//floor(random(3)));
  //   obstacles.push(temp);
  //   tempInt += 3;
  // }
  if (lifespan > 1000 && random(1) < 0.15) { // 15% of the time add a bird
    tempInt = floor(random(3));
    var temp = new Bird(tempInt);//floor(random(3)));
    birds.push(temp);
  } else {//otherwise add a cactus
    tempInt = floor(random(3));
    var temp = new Obstacle(tempInt);//floor(random(3)));
    obstacles.push(temp);
    tempInt += 3;
  }

  obstacleHistory.push(tempInt);

  randomAddition = floor(random(50));
  randomAdditionHistory.push(randomAddition);
  obstacleTimer = 0;
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//what do you think this does?
function showObstacles() {
  for (var i = 0; i < grounds.length; i++) {
    grounds[i].show();
  }
  for (var i = 0; i < obstacles.length; i++) {
    obstacles[i].show();
  }

  for (var i = 0; i < birds.length; i++) {
    birds[i].show();
  }
}

//-------------------------------------------------------------------------------------------------------------------------------------------
//resets all the obstacles after every dino has died
function resetObstacles() {
  randomAdditionHistory = [];
  obstacleHistory = [];

  obstacles = [];
  birds = [];
  obstacleTimer = 0;
  randomAddition = 0;
  groundCounter = 0;
  speed = 10 * speed_scl;
}
class Genome {
  constructor(inputs, out, crossover) {
    this.genes = [];
    this.nodes = [];
    //set input number and output number
    this.inputs = inputs;
    this.outputs = out;
    this.layers = 2;
    this.nextNode = 0;
    this.biasNode;
    this.network = []; //a list of the nodes in the order that they need to be considered in the NN

    if (crossover) {
      return;
    }

    //create input nodes
    for (var i = 0; i < this.inputs; i++) {
      this.nodes.push(new Node(i));
      this.nextNode++;
      this.nodes[i].layer = 0;
    }

    //create output nodes
    for (var i = 0; i < this.outputs; i++) {
      this.nodes.push(new Node(i + this.inputs));
      this.nodes[i + this.inputs].layer = 1;
      this.nextNode++;
    }

    this.nodes.push(new Node(this.nextNode));//bias node
    this.biasNode = this.nextNode;
    this.nextNode++;
    this.nodes[this.biasNode].layer = 0; // bias node in layer 0 (input layer)
  }

  fromJSON(obj) {
    this.genes = [];
    for (var i in obj.genes) {
      var cg = obj.genes[i];
      var cg1 = new connectionGene().fromJSON(cg);
      this.genes.push(cg1);
    }
    this.nodes = [];
    for (var i in obj.nodes) {
      var node = new Node().fromJSON(obj.nodes[i]);
      this.nodes.push(node);
    }
    //set input number and output number
    this.inputs = obj.inputs;
    this.outputs = obj.outputs;
    this.layers = obj.layers;
    this.nextNode = obj.nextNode;
    this.biasNode = obj.biasNode;
    this.network = []; //a list of the nodes in the order that they need to be considered in the NN
    for (var i in obj.network) {
      var node = new Node().fromJSON(obj.network[i]);
      this.network.push(node);
    }
    return this;
  }



  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns the node with a matching number
  //sometimes the nodes will not be in order
  getNode(nodeNumber) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].number == nodeNumber) {
        return this.nodes[i];
      }
    }
    return null;
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //adds the conenctions going out of a node to that node so that it can acess the next node during feeding forward
  connectNodes() {

    for (var i = 0; i < this.nodes.length; i++) {//clear the connections
      this.nodes[i].outputConnections = [];
    }

    for (var i = 0; i < this.genes.length; i++) {//for each connectionGene 
      this.genes[i].fromNode.outputConnections.push(this.genes[i]);//add it to node
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //feeding in input values into the NN and returning output array
  feedForward(inputValues) {
    //set the outputs of the input nodes
    for (var i = 0; i < this.inputs; i++) {
      this.nodes[i].outputValue = inputValues[i];
    }
    this.nodes[this.biasNode].outputValue = 1;//output of bias is 1

    for (var i = 0; i < this.network.length; i++) {//for each node in the network engage it(see node class for what this does)
      this.network[i].engage();
    }

    //the outputs are nodes[inputs] to nodes [inputs+outputs-1]
    var outs = [];
    for (var i = 0; i < this.outputs; i++) {
      outs[i] = this.nodes[this.inputs + i].outputValue;
    }

    for (var i = 0; i < this.nodes.length; i++) {//reset all the nodes for the next feed forward
      this.nodes[i].inputSum = 0;
    }

    return outs;
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //sets up the NN as a list of nodes in order to be engaged 

  generateNetwork() {
    this.connectNodes();
    this.network = [];
    //for each layer add the node in that layer, since layers cannot connect to themselves there is no need to order the nodes within a layer

    for (var l = 0; l < this.layers; l++) {//for each layer
      for (var i = 0; i < this.nodes.length; i++) {//for each node
        if (this.nodes[i].layer == l) {//if that node is in that layer
          this.network.push(this.nodes[i]);
        }
      }
    }
  }
  //-----------------------------------------------------------------------------------------------------------------------------------------
  //mutate the NN by adding a new node
  //it does this by picking a random connection and disabling it then 2 new connections are added 
  //1 between the input node of the disabled connection and the new node
  //and the other between the new node and the output of the disabled connection
  addNode(innovationHistory) {
    //pick a random connection to create a node between
    if (this.genes.length == 0) {
      this.addConnection(innovationHistory);
      return;
    }
    var randomConnection = 0;
    randomConnection = Math.floor(Math.random() * this.genes.length);

    while (this.genes[randomConnection].fromNode == this.nodes[this.biasNode] && this.genes.length != 1) {//dont disconnect bias
      randomConnection = Math.floor(Math.random() * this.genes.length);
    }

    this.genes[randomConnection].enabled = false;//disable it

    var newNodeNo = this.nextNode;
    this.nodes.push(new Node(newNodeNo));
    this.nextNode++;
    //add a new connection to the new node with a weight of 1
    var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.genes[randomConnection].fromNode, this.getNode(newNodeNo));
    this.genes.push(new connectionGene(this.genes[randomConnection].fromNode, this.getNode(newNodeNo), 1, connectionInnovationNumber));


    connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.getNode(newNodeNo), this.genes[randomConnection].toNode);
    //add a new connection from the new node with a weight the same as the disabled connection
    this.genes.push(new connectionGene(this.getNode(newNodeNo), this.genes[randomConnection].toNode, this.genes[randomConnection].weight, connectionInnovationNumber));
    this.getNode(newNodeNo).layer = this.genes[randomConnection].fromNode.layer + 1;


    connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[this.biasNode], this.getNode(newNodeNo));
    //connect the bias to the new node with a weight of 0 
    this.genes.push(new connectionGene(this.nodes[this.biasNode], this.getNode(newNodeNo), 0, connectionInnovationNumber));

    //if the layer of the new node is equal to the layer of the output node of the old connection then a new layer needs to be created
    //more accurately the layer numbers of all layers equal to or greater than this new node need to be incrimented
    if (this.getNode(newNodeNo).layer == this.genes[randomConnection].toNode.layer) {
      for (var i = 0; i < this.nodes.length - 1; i++) {//dont include this newest node
        if (this.nodes[i].layer >= this.getNode(newNodeNo).layer) {
          this.nodes[i].layer++;
        }
      }
      this.layers++;
    }
    this.connectNodes();
  }

  //------------------------------------------------------------------------------------------------------------------
  //adds a connection between 2 nodes which aren't currently connected
  addConnection(innovationHistory) {
    //cannot add a connection to a fully connected network
    if (this.fullyConnected()) {
      console.log("connection failed");
      return;
    }


    //get random nodes
    var randomNode1 = floor(random(this.nodes.length));
    var randomNode2 = floor(random(this.nodes.length));
    while (this.randomConnectionNodesAreShit(randomNode1, randomNode2)) {//while the random nodes are no good
      //get new ones
      randomNode1 = floor(random(this.nodes.length));
      randomNode2 = floor(random(this.nodes.length));
    }
    var temp;
    if (this.nodes[randomNode1].layer > this.nodes[randomNode2].layer) {//if the first random node is after the second then switch
      temp = randomNode2;
      randomNode2 = randomNode1;
      randomNode1 = temp;
    }

    //get the innovation number of the connection
    //this will be a new number if no identical genome has mutated in the same way 
    var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[randomNode1], this.nodes[randomNode2]);
    //add the connection with a random array

    this.genes.push(new connectionGene(this.nodes[randomNode1], this.nodes[randomNode2], random(-1, 1), connectionInnovationNumber));//changed this so if error here
    this.connectNodes();
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------
  randomConnectionNodesAreShit(r1, r2) {
    if (this.nodes[r1].layer == this.nodes[r2].layer) {
      return true; // if the nodes are in the same layer
    }
    if (this.nodes[r1].isConnectedTo(this.nodes[r2])) {
      return true; //if the nodes are already connected
    }



    return false;
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------
  //returns the innovation number for the new mutation
  //if this mutation has never been seen before then it will be given a new unique innovation number
  //if this mutation matches a previous mutation then it will be given the same innovation number as the previous one
  getInnovationNumber(innovationHistory, from, to) {
    var isNew = true;
    var connectionInnovationNumber = nextConnectionNo;
    for (var i = 0; i < innovationHistory.length; i++) {//for each previous mutation
      if (innovationHistory[i].matches(this, from, to)) {//if match found
        isNew = false;//its not a new mutation
        connectionInnovationNumber = innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
        break;
      }
    }

    if (isNew) {//if the mutation is new then create an arrayList of integers representing the current state of the genome
      var innoNumbers = [];
      for (var i = 0; i < this.genes.length; i++) {//set the innovation numbers
        innoNumbers.push(this.genes[i].innovationNo);
      }

      //then add this mutation to the innovationHistory 
      innovationHistory.push(new connectionHistory(from.number, to.number, connectionInnovationNumber, innoNumbers));
      nextConnectionNo++;
    }
    return connectionInnovationNumber;
  }
  //----------------------------------------------------------------------------------------------------------------------------------------

  //returns whether the network is fully connected or not
  fullyConnected() {
    var maxConnections = 0;
    var nodesInLayers = [];//array which stored the amount of nodes in each layer

    //populate array
    for (var i = 0; i < this.nodes.length; i++) {
      if (!nodesInLayers[this.nodes[i].layer]) {
        nodesInLayers[this.nodes[i].layer] = 0;
      }
      nodesInLayers[this.nodes[i].layer] += 1;
    }

    //for each layer the maximum amount of connections is the number in this layer * the number of nodes infront of it
    //so lets add the max for each layer together and then we will get the maximum amount of connections in the network
    for (var i = 0; i < this.layers - 1; i++) {
      var nodesInFront = 0;
      for (var j = i + 1; j < this.layers; j++) {//for each layer infront of this layer
        nodesInFront += nodesInLayers[j];//add up nodes
      }

      maxConnections += nodesInLayers[i] * nodesInFront;
    }

    if (maxConnections == this.genes.length) {//if the number of connections is equal to the max number of connections possible then it is full
      return true;
    }
    return false;
  }


  //-------------------------------------------------------------------------------------------------------------------------------
  //mutates the genome
  mutate(innovationHistory) {
    if (this.genes.length == 0) {
      this.addConnection(innovationHistory);
    }

    var rand1 = random(1);
    if (rand1 < 0.8) { // 80% of the time mutate weights
      for (var i = 0; i < this.genes.length; i++) {
        this.genes[i].mutateWeight();
      }
    }
    //20% of the time add a new connection
    var rand2 = random(1);
    if (rand2 < 0.08) {
      this.addConnection(innovationHistory);
    }


    //2% of the time add a node
    var rand3 = random(1);
    if (rand3 < 0.02) {
      this.addNode(innovationHistory);
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------
  //called when this Genome is better that the other parent
  crossover(parent2) {
    var child = new Genome(this.inputs, this.outputs, true);
    child.genes = [];
    child.nodes = [];
    child.layers = this.layers;
    child.nextNode = this.nextNode;
    child.biasNode = this.biasNode;
    var childGenes = [];//list of genes to be inherrited form the parents
    var isEnabled = [];
    //all inherrited genes
    for (var i = 0; i < this.genes.length; i++) {
      var setEnabled = true;//is this node in the chlid going to be enabled

      var parent2gene = this.matchingGene(parent2, this.genes[i].innovationNo);
      if (parent2gene != -1) {//if the genes match
        if (!this.genes[i].enabled || !parent2.genes[parent2gene].enabled) {//if either of the matching genes are disabled

          if (random(1) < 0.75) {//75% of the time disabel the childs gene
            setEnabled = false;
          }
        }
        var rand = random(1);
        if (rand < 0.5) {
          childGenes.push(this.genes[i]);

          //get gene from this fucker
        } else {
          //get gene from parent2
          childGenes.push(parent2.genes[parent2gene]);
        }
      } else {//disjoint or excess gene
        childGenes.push(this.genes[i]);
        setEnabled = this.genes[i].enabled;
      }
      isEnabled.push(setEnabled);
    }


    //since all excess and disjoint genes are inherrited from the more fit parent (this Genome) the childs structure is no different from this parent | with exception of dormant connections being enabled but this wont effect nodes
    //so all the nodes can be inherrited from this parent
    for (var i = 0; i < this.nodes.length; i++) {
      child.nodes.push(this.nodes[i].clone());
    }

    //clone all the connections so that they connect the childs new nodes

    for (var i = 0; i < childGenes.length; i++) {
      child.genes.push(childGenes[i].clone(child.getNode(childGenes[i].fromNode.number),
        child.getNode(childGenes[i].toNode.number)));
      child.genes[i].enabled = isEnabled[i];
    }

    child.connectNodes();
    return child;
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //returns whether or not there is a gene matching the input innovation number  in the input genome
  matchingGene(parent2, innovationNumber) {
    for (var i = 0; i < parent2.genes.length; i++) {
      if (parent2.genes[i].innovationNo == innovationNumber) {
        return i;
      }
    }
    return -1; //no matching gene found
  }
  //----------------------------------------------------------------------------------------------------------------------------------------
  //prints out info about the genome to the console 
  printGenome() {
    console.log("Prvar genome  layers:" + this.layers);
    console.log("bias node: " + this.biasNode);
    console.log("this.nodes");
    for (var i = 0; i < this.nodes.length; i++) {
      console.log(this.nodes[i].number + ",");
    }
    console.log("Genes");
    for (var i = 0; i < this.genes.length; i++) {//for each connectionGene 
      console.log("gene " + this.genes[i].innovationNo + "From node " + this.genes[i].fromNode.number + "To node " + this.genes[i].toNode.number +
        "is enabled " + this.genes[i].enabled + "from layer " + this.genes[i].fromNode.layer + "to layer " + this.genes[i].toNode.layer + "weight: " + this.genes[i].weight);
    }

    console.log();
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //returns a copy of this genome
  clone() {

    var clone = new Genome(this.inputs, this.outputs, true);

    for (var i = 0; i < this.nodes.length; i++) {//copy nodes
      clone.nodes.push(this.nodes[i].clone());
    }

    //copy all the connections so that they connect the clone new nodes

    for (var i = 0; i < this.genes.length; i++) {//copy genes
      clone.genes.push(this.genes[i].clone(clone.getNode(this.genes[i].fromNode.number), clone.getNode(this.genes[i].toNode.number)));
    }

    clone.layers = this.layers;
    clone.nextNode = this.nextNode;
    clone.biasNode = this.biasNode;
    clone.connectNodes();

    return clone;
  }

  cloneForJSON() {

    var clone = new Genome(this.inputs, this.outputs, true);

    for (var i = 0; i < this.nodes.length; i++) {//copy nodes
      clone.nodes.push(this.nodes[i].clone());
    }

    //copy all the connections so that they connect the clone new nodes

    for (var i = 0; i < this.genes.length; i++) {//copy genes
      clone.genes.push(this.genes[i].cloneForJSON(clone.getNode(this.genes[i].fromNode.number), clone.getNode(this.genes[i].toNode.number)));
    }

    clone.layers = this.layers;
    clone.nextNode = this.nextNode;
    clone.biasNode = this.biasNode;
    // clone.connectNodes();

    return clone;
  }
  //----------------------------------------------------------------------------------------------------------------------------------------
  //draw the genome on the screen
  drawGenome(startX, startY, w, h) {
    //i know its ugly but it works (and is not that important) so I'm not going to mess with it
    var allNodes = [];
    var nodePoses = [];
    var nodeNumbers = [];
    var nodeColors = [];

    //get the positions on the screen that each node is supposed to be in


    //split the nodes into layers
    for (var i = 0; i < this.layers; i++) {
      var temp = [];
      for (var j = 0; j < this.nodes.length; j++) {//for each node 
        if (this.nodes[j].layer == i) {//check if it is in this layer
          temp.push(this.nodes[j]); //add it to this layer
        }
      }
      allNodes.push(temp);//add this layer to all nodes
    }

    //for each layer add the position of the node on the screen to the node posses arraylist
    for (var i = 0; i < this.layers; i++) {
      fill(255, 0, 0);
      var x = startX + float(i * w) / float(this.layers - 1.0);
      for (var j = 0; j < allNodes[i].length; j++) {//for the position in the layer
        var y = startY + float((j + 1.0) * h) / float(allNodes[i].length + 1.0);
        nodePoses.push(createVector(x, y));
        nodeNumbers.push(allNodes[i][j].number);
        if (i == 0) {
          nodeColors.push(color(207, 254, 207));
        }
        else if (i == this.layers - 1) {
          nodeColors.push(color(255, 254, 160));
        }
        else {
          nodeColors.push(color(206, 237, 254));
        }
        if (i == this.layers - 1) {
          // console.log(i + " " + j + " " + x + " " + y);
        }
      }
    }

    //draw connections 
    stroke(0);
    strokeWeight(2);
    for (var i = 0; i < this.genes.length; i++) {
      if (this.genes[i].enabled) {
        stroke(0);
      } else {
        stroke(100);
      }
      var from;
      var to;
      from = nodePoses[nodeNumbers.indexOf(this.genes[i].fromNode.number)];
      to = nodePoses[nodeNumbers.indexOf(this.genes[i].toNode.number)];
      if (this.genes[i].weight > 0) {
        stroke(71, 120, 82);
      } else {
        stroke(255, 0, 0);
      }
      strokeWeight(map(abs(this.genes[i].weight * scl), 0, 1, 0, 5));
      line(from.x, from.y, to.x, to.y);
    }

    //draw nodes last so they appear ontop of the connection lines
    for (var i = 0; i < nodePoses.length; i++) {
      fill(nodeColors[i]);
      stroke(0);
      strokeWeight(1);
      ellipse(nodePoses[i].x, nodePoses[i].y, 20 * scl, 20 * scl);
      // textSize(10);
      // fill(0);
      // textAlign(CENTER, CENTER);


      // text(nodeNumbers[i], nodePoses[i].x, nodePoses[i].y);
    }
  }
}
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
class Node {
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //constructor
  constructor(no) {
    this.number = no;
    this.inputSum = 0;//current sum i.e. before activation
    this.outputValue = 0; //after activation function is applied
    this.outputConnections = [];
    this.layer = 0;
    this.drawPos = new createVector();
  }
  fromJSON(obj) {
    this.number = obj.number;
    this.inputSum = obj.inputSum;//current sum i.e. before activation
    this.outputValue = obj.outputValue; //after activation function is applied
    this.outputConnections = [];
    this.layer = obj.layer;
    this.drawPos = new createVector();
    return this;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //the node sends its output to the inputs of the nodes its connected to
  engage() {
    if (this.layer != 0) {//no sigmoid for the inputs and bias
      this.outputValue = this.sigmoid(this.inputSum);
    }

    for (var i = 0; i < this.outputConnections.length; i++) {//for each connection
      if (this.outputConnections[i].enabled) {//dont do shit if not enabled
        this.outputConnections[i].toNode.inputSum += this.outputConnections[i].weight * this.outputValue;
        //add the weighted output to the sum of the inputs of whatever node this node is connected to
      }
    }
  }
  //----------------------------------------------------------------------------------------------------------------------------------------
  //not used
  stepFunction(x) {
    if (x < 0) {
      return 0;
    } else {
      return 1;
    }
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //sigmoid activation function
  sigmoid(x) {
    var y = 1 / (1 + pow(Math.E, -4.9 * x));
    // console.log("sigmoid x: " + x + " y: " + y);
    return y;
  }
  //----------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns whether this node connected to the parameter node
  //used when adding a new connection 
  isConnectedTo(node) {
    if (node.layer == this.layer) {//nodes in the same layer cannot be connected
      return false;
    }

    //you get it
    if (node.layer < this.layer) {
      for (var i = 0; i < node.outputConnections.length; i++) {
        if (node.outputConnections[i].toNode == this) {
          return true;
        }
      }
    } else {
      for (var i = 0; i < this.outputConnections.length; i++) {
        if (this.outputConnections[i].toNode == node) {
          return true;
        }
      }
    }

    return false;
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns a copy of this node
  clone() {
    var clone = new Node(this.number);
    clone.layer = this.layer;
    return clone;
  }

  cloneForJSON() {
    var clone = new Node(this.number);
    clone.number = this.number;
    clone.inputSum = this.inputSum;//current sum i.e. before activation
    clone.outputValue = this.outputValue; //after activation function is applied
    clone.outputConnections = []; // reason of everything : (
    clone.layer = this.layer;
    clone.drawPos = new createVector();
    return clone;
  }

}
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
class Population {
  //------------------------------------------------------------------------------------------------------------------------------------------
  //constructor
  constructor(size) {

    this.pop = [];
    this.bestPlayer;//the best ever player 
    this.bestScore = 0;//the score of the best ever player
    this.gen = 0;
    this.innovationHistory = [];
    this.genPlayers = [];
    this.species = [];

    this.massExtinctionEvent = false;
    this.newStage = false;
    this.populationLife = 0;

    for (var i = 0; i < size; i++) {
      this.pop.push(new Player());
      this.pop[i].brain.mutate(this.innovationHistory);
      this.pop[i].brain.generateNetwork();
    }
  }

  fromJSON(obj) {
    for (var key in obj.pop) {
      var player = new Player().fromJSON(obj.pop[key]);
      this.pop.push(player);
    }
    this.bestPlayer = new Player().fromJSON(obj.bestPlayer);
    this.bestScore = obj.bestScore;//the score of the best ever player
    this.gen = obj.gen;
    this.innovationHistory = [];
    for (var key in obj.innovationHistory) {
      var obj1 = obj.innovationHistory[key];
      // var temp = [];
      // arrayCopy(obj1.innovationNumbers,temp);
      var innovationHistory = new connectionHistory(obj1.fromNode, obj1.toNode, obj1.innovationNumber, obj1.innovationNumbers);
      this.innovationHistory.push(innovationHistory);
    }
    for (var key in obj.genPlayers) {
      var player = new Player().fromJSON(obj.genPlayers[key]);
      this.genPlayers.push(player);
    }
    this.species = [];
    for (var key in obj.species) {
      var species = new Species().fromJSON(obj.species[key]);
      this.species.push(species);
    }

    this.massExtinctionEvent = obj.massExtinctionEvent;
    this.newStage = obj.newStage;
    this.populationLife = obj.populationLife;

  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //update all the players which are alive
  updateAlive() {
    this.populationLife++;
    for (var i = 0; i < this.pop.length; i++) {
      if (!this.pop[i].dead) {
        this.pop[i].look();//get inputs for brain 
        this.pop[i].think();//use outputs from neural network
        this.pop[i].update();//move the player according to the outputs from the neural network
        if (!showNothing) {
          this.pop[i].show();
        }
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //returns true if all the players are dead      sad
  done() {
    for (var i = 0; i < this.pop.length; i++) {
      if (!this.pop[i].dead) {
        return false;
      }
    }
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //sets the best player globally and for this gen
  setBestPlayer() {
    var tempBest = this.species[0].players[0];
    tempBest.gen = this.gen;


    //if best this gen is better than the global best score then set the global best as the best this gen

    if (tempBest.score >= this.bestScore) {
      this.genPlayers.push(tempBest.cloneForReplay());
      console.log("old best: " + this.bestScore);
      console.log("new best: " + tempBest.score);
      this.bestScore = tempBest.score;
      this.bestPlayer = tempBest.cloneForReplay();
      this.bestPlayer.brain.printGenome();
    }
  }

  saveBests() {
    // save bests to file
    // var jsons = stringify(this.bestPlayer, null, 2);
    // saveStrings(jsons.split('\n'), 'bestplayers.json', 'json');
    var jsons = [];
    for (var i = 0; i < this.genPlayers.length; i++) {
      var player = this.genPlayers[i].cloneForReplay();
      var genes = player.brain.genes;
      for (var j = 0; j < genes.length; j++) {
        var connectionGene = genes[j];
        connectionGene.fromNode.outputConnections = [];
      }
      jsons.push(player);
    }
    jsons = JSON.stringify(jsons, null, 2);
    saveStrings(jsons.split('\n'), 'bestplayers.json', 'json');
    console.log(jsons);
  }

  savePopulation() {
    // save last generation to file
    // var jsons = stringify(this.bestPlayer, null, 2);
    // saveStrings(jsons.split('\n'), 'bestplayers.json', 'json');
    var players = [];
    for (var i = 0; i < this.pop.length; i++) {
      // var player = this.pop[i].cloneForReplay();
      // var genes = player.brain.genes;
      // for (var j = 0; j < genes.length; j++) {
      //   var connectionGene = genes[j];
      //   connectionGene.fromNode.outputConnections = [];
      var player = this.pop[i].cloneForJSON();
      players.push(player);
    }


    var clone = new Population(0);
    clone.pop = players;
    clone.bestPlayer = this.bestPlayer.cloneForJSON();//the best ever player 
    clone.bestScore = this.bestScore;//the score of the best ever player
    clone.gen = this.gen;
    arrayCopy(this.innovationHistory, clone.innovationHistory);
    var genplayers = [];
    for (var i = 0; i < this.genPlayers.length; i++) {
      var player = this.genPlayers[i].cloneForJSON();
      // var genes = player.brain.genes;
      // for (var j = 0; j < genes.length; j++) {
      //   var connectionGene = genes[j];
      //   connectionGene.fromNode.outputConnections = [];
      // }
      genplayers.push(player);
    }
    clone.genPlayers = genplayers;
    clone.species = [];
    for (var i = 0; i < this.species.length; i++) {
      clone.species.push(this.species[i].cloneForJSON());
    }

    clone.massExtinctionEvent = this.massExtinctionEvent;
    clone.newStage = this.newStage;
    clone.populationLife = this.populationLife;

    var jsons = JSON.stringify(clone, null, 2);
    saveStrings(jsons.split('\n'), 'population.json', 'json');
    console.log(jsons);
  }

  // playersToJson(playerArray) {
  //   var jArry = [];
  //   for (var i = 0; i < playerArray.length; i++) {
  //     var player = playerArray[i];
  //     var jObj = {};
  //     jObj.id = i;
  //     jObj.layers = player.brain.layers;
  //     jObj.bias = player.brain.biasNode;
  //     jObj.nodes = [];
  //     for (var j = 0; j < player.brain.nodes.length; j++) {
  //       jObj.nodes.push(player.brain.nodes[j].number);
  //     }
  //     jObj.genes = [];
  //     var temp = [];
  //     for (var j = 0; j < player.brain.genes.length; j++) {
  //       var temp1 = [];
  //       temp1.push(player.brain.genes[j].innovationNo);
  //       temp1.push(player.brain.genes[j].fromNode.number);
  //       temp1.push(player.brain.genes[j].toNode.number);
  //       temp1.push(player.brain.genes[j].enabled);
  //       temp1.push(player.brain.genes[j].fromNode.layer);
  //       temp1.push(player.brain.genes[j].toNode.layer);
  //       temp1.push(player.brain.genes[j].weight);

  //       temp.push(temp1);
  //     }
  //     arrayCopy(temp, jObj.genes);
  //     jArry.push(jObj)
  //   }
  //   return jArry
  // }

  playersToJson(playerArray) {
    var jArry = [];
    for (var i = 0; i < playerArray.length; i++) {
      var jObj = stringify(playerArray[i], null, 2);
      jArry.push(jObj)
    }
    return jArry
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------
  //this function is called when all the players in the population are dead and a new generation needs to be made
  naturalSelection() {
    var previousBest = this.pop[0];
    // if (this.genPlayers.length > 1) {
    //   if (this.gen - this.genPlayers[this.genPlayers.length - 1].gen > 50) {
    //     // no new best player in 50 generation
    //     this.massExtinctionEvent = true;
    //   }
    // }
    this.speciate();//seperate the population into species 
    this.calculateFitness();//calculate the fitness of each player
    this.sortSpecies();//sort the species to be ranked in fitness order, best first
    if (this.massExtinctionEvent) {
      this.massExtinction();
      this.massExtinctionEvent = false;
    }
    this.cullSpecies();//kill off
    this.setBestPlayer();//save the best player of this gen
    this.killStaleSpecies();//remove species which haven't improved in the last 15(ish) generations
    this.killBadSpecies();//kill species which are so bad that they cant reproduce


    // console.log("generation " + this.gen + " Number of mutations " + this.innovationHistory.length + " species: " + this.species.length, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");


    var averageSum = this.getAvgFitnessSum();
    var children = [];//the next generation
    // console.log("Species:");
    for (var j = 0; j < this.species.length; j++) {//for each species
      // console.log("best unadjusted fitness: " + this.species[j].bestFitness);
      // for (var i = 0; i < this.species[j].players.length; i++) {
      //   console.log("player " + i, "fitness: " + this.species[j].players[i].fitness + "score " + this.species[j].players[i].score + ' ');
      // }
      children.push(this.species[j].champ.clone());//add champion without any mutation

      var NoOfChildren = floor(this.species[j].averageFitness / averageSum * this.pop.length) - 1;//the number of children this species is allowed, note -1 is because the champ is already added
      for (var i = 0; i < NoOfChildren; i++) {//get the calculated amount of children from this species
        children.push(this.species[j].giveMeBaby(this.innovationHistory));
      }
    }
    if (children.length < this.pop.length) {
      children.push(previousBest.clone());
    }
    while (children.length < this.pop.length) {//if not enough babies (due to flooring the number of children to get a whole int) 
      children.push(this.species[0].giveMeBaby(this.innovationHistory));//get babies from the best species
    }
    // while (children.length < this.pop.length) {//if not enough babies (due to flooring the number of children to get a whole int) 
    //   var player = new Player();
    //   player.gen = this.gen;
    //   player.brain.mutate(this.innovationHistory);
    //   children.push(player);//get babies from the best species
    // }
    this.pop = [];
    arrayCopy(children, this.pop); //set the children as the current population
    this.gen += 1;
    for (var i = 0; i < this.pop.length; i++) {//generate networks for each of the children
      this.pop[i].brain.generateNetwork();
    }

    this.populationLife = 0;
  }

  //------------------------------------------------------------------------------------------------------------------------------------------
  //seperate population into species based on how similar they are to the leaders of each species in the previous gen
  speciate() {
    for (var s of this.species) {//empty species
      s.players = [];
    }
    for (var i = 0; i < this.pop.length; i++) {//for each player
      var speciesFound = false;
      for (var s of this.species) {//for each species
        if (s.sameSpecies(this.pop[i].brain)) {//if the player is similar enough to be considered in the same species
          s.addToSpecies(this.pop[i]);//add it to the species
          speciesFound = true;
          break;
        }
      }
      if (!speciesFound) {//if no species was similar enough then add a new species with this as its champion
        this.species.push(new Species(this.pop[i]));
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //calculates the fitness of all of the players 
  calculateFitness() {
    for (var i = 1; i < this.pop.length; i++) {
      this.pop[i].calculateFitness();
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //sorts the players within a species and the species by their fitnesses
  sortSpecies() {
    //sort the players within a species
    for (var s of this.species) {
      s.sortSpecies();
    }

    //sort the species by the fitness of its best player
    for (var i = 0; i < this.species.length; i++) {
      var max = 0;
      var maxIndex = 0;
      for (var j = i; j < this.species.length; j++) {
        if (this.species[j].bestFitness > max) {
          max = this.species[j].bestFitness;
          maxIndex = j;
        }
      }
      if (maxIndex != 0) {
        var temp = this.species[maxIndex];
        this.species[maxIndex] = this.species[i];
        this.species[i] = temp;
      }

    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //kills all species which haven't improved in 15 generations
  killStaleSpecies() {
    for (var i = 2; i < this.species.length; i++) {
      if (this.species[i].staleness >= 15) {
        this.species.splice(i, 1);
        i--;
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //if a species sucks so much that it wont even be allocated 1 child for the next generation then kill it now
  killBadSpecies() {
    var averageSum = this.getAvgFitnessSum();

    for (var i = 1; i < this.species.length; i++) {
      if (this.species[i].averageFitness / averageSum * this.pop.length < 1) {//if wont be given a single child 
        this.species.splice(i, 1);//sad
        i--;
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //returns the sum of each species average fitness
  getAvgFitnessSum() {
    var averageSum = 0;
    for (var s of this.species) {
      averageSum += s.averageFitness;
    }
    return averageSum;
  }

  //------------------------------------------------------------------------------------------------------------------------------------------
  //kill the bottom half of each species
  cullSpecies() {
    for (var s of this.species) {
      s.cull(); //kill bottom half
      s.fitnessSharing();//also while we're at it lets do fitness sharing
      s.setAverage();//reset averages because they will have changed
    }
  }


  massExtinction() {
    for (var i = 5; i < this.species.length; i++) {
      this.species.splice(i, 1);//sad
      i--;
    }
  }
}
class Species {
  //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 
  //constructor which takes in the player which belongs to the species
  constructor(p) {
    this.players = [];
    this.bestFitness = 0;
    this.champ;
    this.averageFitness = 0;
    this.staleness = 0;//how many generations the species has gone without an improvement
    this.rep;

    //--------------------------------------------
    //coefficients for testing compatibility 
    this.excessCoeff = 1;
    this.weightDiffCoeff = 0.5;
    this.compatibilityThreshold = 3;
    if (p) {
      this.players.push(p);
      //since it is the only one in the species it is by default the best
      this.bestFitness = p.fitness;
      this.rep = p.brain.clone();
      this.champ = p.cloneForReplay();
    }
  }

  cloneForJSON() {
    var clone = new Species();
    clone.players = [];
    for (var i = 0; i < this.players.length; i++) {
      clone.players.push(this.players[i].cloneForJSON());
    }
    clone.bestFitness = this.bestFitness;
    clone.champ = this.champ.cloneForJSON();
    clone.averageFitness = this.averageFitness;
    clone.staleness = this.staleness;//how many generations the species has gone without an improvement
    clone.rep = this.rep.cloneForJSON();

    //--------------------------------------------
    //coefficients for testing compatibility 
    clone.excessCoeff = this.excessCoeff;
    clone.weightDiffCoeff = this.weightDiffCoeff;
    clone.compatibilityThreshold = this.compatibilityThreshold;
    return clone;
  }

  fromJSON(obj) {
    this.players = [];
    for (var key in obj.players) {
      this.players.push(new Player().fromJSON(obj.players[key]));
    }
    this.bestFitness = obj.bestFitness;
    this.champ = new Player().fromJSON(obj.champ);
    this.averageFitness = obj.averageFitness;
    this.staleness = obj.staleness;//how many generations the species has gone without an improvement
    this.rep = new Genome().fromJSON(obj.rep);

    //--------------------------------------------
    //coefficients for testing compatibility 
    this.excessCoeff = obj.excessCoeff;
    this.weightDiffCoeff = obj.weightDiffCoeff;
    this.compatibilityThreshold = obj.compatibilityThreshold;
    return this;
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 
  //returns whether the parameter genome is in this species
  sameSpecies(g) {
    var compatibility;
    var excessAndDisjoint = this.getExcessDisjoint(g, this.rep);//get the number of excess and disjoint genes between this player and the current species rep
    var averageWeightDiff = this.averageWeightDiff(g, this.rep);//get the average weight difference between matching genes


    var largeGenomeNormaliser = g.genes.length - 20;
    if (largeGenomeNormaliser < 1) {
      largeGenomeNormaliser = 1;
    }

    compatibility = (this.excessCoeff * excessAndDisjoint / largeGenomeNormaliser) + (this.weightDiffCoeff * averageWeightDiff);//compatablilty formula
    return (this.compatibilityThreshold > compatibility);
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 
  //add a player to the species
  addToSpecies(p) {
    this.players.push(p);
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ 
  //returns the number of excess and disjoint genes between the 2 input genomes
  //i.e. returns the number of genes which dont match
  getExcessDisjoint(brain1, brain2) {
    var matching = 0.0;
    for (var i = 0; i < brain1.genes.length; i++) {
      for (var j = 0; j < brain2.genes.length; j++) {
        if (brain1.genes[i].innovationNo == brain2.genes[j].innovationNo) {
          matching++;
          break;
        }
      }
    }
    return (brain1.genes.length + brain2.genes.length - 2 * (matching));//return no of excess and disjoint genes
  }
  //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns the avereage weight difference between matching genes in the input genomes
  averageWeightDiff(brain1, brain2) {
    if (brain1.genes.length == 0 || brain2.genes.length == 0) {
      return 0;
    }


    var matching = 0;
    var totalDiff = 0;
    for (var i = 0; i < brain1.genes.length; i++) {
      for (var j = 0; j < brain2.genes.length; j++) {
        if (brain1.genes[i].innovationNo == brain2.genes[j].innovationNo) {
          matching++;
          totalDiff += abs(brain1.genes[i].weight - brain2.genes[j].weight);
          break;
        }
      }
    }
    if (matching == 0) {//divide by 0 error
      return 100;
    }
    return totalDiff / matching;
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //sorts the species by fitness 
  sortSpecies() {

    //selection sort 
    for (var i = 0; i < this.players.length; i++) {
      var max = 0;
      var maxIndex = 0;
      for (var j = i; j < this.players.length; j++) {
        if (this.players[j].fitness > max) {
          max = this.players[j].fitness;
          maxIndex = j;
        }
      }
      //swap
      if (maxIndex != 0) {
        var temp = this.players[maxIndex];
        this.players[maxIndex] = this.players[i];
        this.players[i] = temp;
      }
    }
    if (this.players.length == 0) {
      this.staleness = 200;
      return;
    }
    //if new best player
    if (this.players[0].fitness > this.bestFitness) {
      this.staleness = 0;
      this.bestFitness = this.players[0].fitness;
      this.rep = this.players[0].brain.clone();
      this.champ = this.players[0].cloneForReplay();
    } else {//if no new best player
      this.staleness++;
    }
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //simple stuff
  setAverage() {

    var sum = 0;
    for (var i = 0; i < this.players.length; i++) {
      sum += this.players[i].fitness;
    }
    this.averageFitness = sum / this.players.length;
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  //gets baby from the players in this species
  giveMeBaby(innovationHistory) {
    var baby;
    if (random(1) < 0.25) {//25% of the time there is no crossover and the child is simply a clone of a random(ish) player
      baby = this.selectPlayer().clone();
    } else {//75% of the time do crossover 

      //get 2 random(ish) parents 
      var parent1 = this.selectPlayer();
      var parent2 = this.selectPlayer();

      //the crossover function expects the highest fitness parent to be the object and the lowest as the argument
      if (parent1.fitness < parent2.fitness) {
        baby = parent2.crossover(parent1);
      } else {
        baby = parent1.crossover(parent2);
      }
    }
    baby.brain.mutate(innovationHistory);//mutate that baby brain
    return baby;
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //selects a player based on it fitness
  selectPlayer() {
    var fitnessSum = 0;
    for (var i = 0; i < this.players.length; i++) {
      fitnessSum += this.players[i].fitness;
    }

    var rand = random(fitnessSum);
    var runningSum = 0;

    for (var i = 0; i < this.players.length; i++) {
      runningSum += this.players[i].fitness;
      if (runningSum > rand) {
        return this.players[i];
      }
    }
    //unreachable code to make the parser happy
    return this.players[0];
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //kills off bottom half of the species
  cull() {
    if (this.players.length > 2) {
      for (var i = this.players.length / 2; i < this.players.length; i++) {
        this.players.splice(i, 1);
        i--;
      }
    }
  }
  //------------------------------------------------------------------------------------------------------------------------------------------
  //in order to protect unique players, the fitnesses of each player is divided by the number of players in the species that that player belongs to 
  fitnessSharing() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].fitness /= this.players.length;
    }
  }
}
//# sourceMappingURL=all.js.map
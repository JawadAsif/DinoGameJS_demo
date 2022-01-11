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
  fontBold = loadFont('../fonts/Raleway-Bold.ttf');
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
      textFont(fontBold);
      fill('#036367');
      text("Artificial Intelligence", width / 2 + 190, height - 30);

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
      textFont(fontBold);
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
      textFont(fontBold);
      fill('#036367');
      text("Artificial Intelligence", width / 2 + 190, height - 30);

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
      textFont(fontBold);
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
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
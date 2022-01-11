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
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
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
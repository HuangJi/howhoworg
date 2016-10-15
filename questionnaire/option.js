'use strict'

class Option {
  constructor (name, score) {
    this.name = name;
    this.score = score;
    this.parent = null;
    this.isCheck = false;
  }
}

module.exports = Option;
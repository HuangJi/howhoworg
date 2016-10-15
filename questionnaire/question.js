'use strict'
var Option = require('./option');

class Question {
  constructor (sum, weight, number, desciption) {
    this.sum = sum;
    this.options = null;
    this.weight = weight;
    this.number = number;
    this.weightedScore = null;
    this.desciption = desciption;
    this.score = null;
    this.parent = null;
  }

  setOptions (nameList, scoreList) {
  	var options = [];
  	for (var i = 0; i < nameList.length; i++) {
  		options.push(new Option(nameList[i], scoreList[i]));
  	}
  	this.options = options;
  }
}

module.exports = Question;
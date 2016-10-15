'use strict'
var Question = require('./question');

class Questionnaire {
  constructor (questions, fundSet) {
    this.resultType = null;
    this.totalScore = null;
    this.questions = questions;
    this.fundSet = fundSet;
  }

  resultClassify() {

  }
}

module.exports = Questionnaire;
"use strict";

const Validator = require('./validator');

module.exports = class RegisterValidator extends Validator {
  /**
   * Rules
   */
  rules = {
    name: 'required|string',
    email: 'required|email',
    password: 'required',
  };
}

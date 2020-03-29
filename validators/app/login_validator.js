"use strict";

const Validator = require('../validator');

module.exports = class LoginValidator extends Validator {
  /**
   * Rules
   */
  rules = {
    name: 'required:email',
    password: 'required|string',
  };
}

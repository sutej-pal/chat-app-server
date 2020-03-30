"use strict";

const Validator = require('../validator');

module.exports = class LoginValidator extends Validator {
  /**
   * Rules
   */
  rules = {
    email: 'required|email',
    password: 'required|string',
  };
}

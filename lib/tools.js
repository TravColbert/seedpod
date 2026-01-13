"use strict";

module.exports = function (explicitConfig = {}) {
  const config = require("config");

  /**
   * Searches through all possible configuration sources to set up Zest
   *
   * Starts with a default value. Proceeds with explicit config passed
   * directly to the factory. Proceeds to environment set through .env.
   * Finally checks config files in config folder.
   *
   * @param {*} valueKey      The key of the value being searched for
   * @param {*} defaultValue  A default value
   * @param {*} showValue     Whether to print found value to console
   * @returns                 The found value
   */
  return function (valueKey, defaultValue, showValue = false) {
    let value = defaultValue;
    if (explicitConfig && valueKey in explicitConfig) {
      // config in explicit config?
      value = explicitConfig[valueKey];
    } else if (valueKey in process.env) {
      // config in process.env (shell environment)?
      value = process.env[valueKey];
    } else if (valueKey in config) {
      // config in config file?
      value = config[valueKey];
    }
    showValue && console.debug(` config: ${valueKey} => ${value}`);
    return value;
  };
};

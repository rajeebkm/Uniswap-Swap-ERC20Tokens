const Swaps = artifacts.require("Swap");

module.exports = function (deployer) {
  deployer.deploy(Swaps);
};

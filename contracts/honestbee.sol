pragma solidity ^0.4.2;

import 'SNStandardService.sol';

contract honestbee is SNStandardService {
  function honestbee() {
    owner = msg.sender;
    minEthPerRequest = 0.5 ether;
  }
}

pragma solidity ^0.4.8;

contract WalletInterface {

  function refundRequest(uint256 _requestId) public payable returns (bool success) {}
  function () public payable {}
}

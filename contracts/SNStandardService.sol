pragma solidity ^0.4.2;

import 'SNServiceInterface.sol';
import 'WalletInterface.sol';

/**
 * Smart Node Standard Service
 */
contract SNStandardService is SNServiceInterface {
  address public owner;   // able to withdraw earnings
  address public manager; // able to process and refund requests
  uint256 public requestsCount;
  uint256 public minEthPerRequest;

  modifier onlyOwner {
    if (msg.sender != owner) {
      throw;
    }
    _;
  }

  modifier onlyManagerAndOwner {
    if (msg.sender != owner && msg.sender != manager) {
      throw;
    }
    _;
  }

  /**
   * Constructor
   */
  function SmartNodeService(uint256 _minEthPerRequest) {
    owner = msg.sender;
    minEthPerRequest = _minEthPerRequest;
  }

  function changeOwner(address _candidate) public onlyOwner {
    owner = _candidate;
  }

  function changeManager(address _candidate) public onlyOwner {
    manager = _candidate;
  }

  function changeMinEthPerRequest(uint256 _newMinEthPerRequest) public onlyManagerAndOwner {
    minEthPerRequest = _newMinEthPerRequest;
  }

  /**
   * Make a new request
   */
  function make(string _params) public payable returns (uint256 requestId) {
    if (msg.value < minEthPerRequest) {
      throw;
    }

    uint256 id = requestsCount;
    NewRequest(id, msg.sender, _params);
    RequestUpdate(id, 10, msg.value, 'Make');
    requestsCount = requestsCount + 1;
    return id;
  }

  /**
   * Update request
   */
  function update(uint256 _id, uint8 _state, uint256 _balance, string _remarks) public onlyManagerAndOwner {
    RequestUpdate(_id, _state, _balance, _remarks);
  }

  /**
   * Finalize request (success or failure) and refund balance to client
   */
  function finalize(uint256 _id, uint8 _state, address _client, uint256 _value, string _remarks) public onlyManagerAndOwner {
    // Check for final states
    if (_state < 50) {
      throw;
    }

    // Send as Wallet.refund if it's a SN Wallet, else a normal send
    if (!WalletInterface(_client).refundRequest.value(_value)(_id)) {
      if (!_client.call.value(_value)()) {
       throw;
      } else {
        RequestUpdate(_id, _state, 0, _remarks);
      }
    } else {
      RequestUpdate(_id, _state, 0, _remarks);
    }
  }

  function withdraw(uint256 _value) onlyOwner {
    if (!owner.call.value(_value)()) {
        throw;
    }
  }

  function destroy() onlyOwner {
    selfdestruct(owner);
  }
}

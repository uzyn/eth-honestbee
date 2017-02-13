pragma solidity ^0.4.2;

import 'SNServiceInterface.sol';

/**
 * Smart Node Standard Service
 */
contract SNStandardService is SNServiceInterface {
  address public owner;   // able to withdraw earnings
  address public manager; // able to process and refund requests
  uint256 public requestsCount;
  uint256 public minEthPerRequest;

  /**
   * State values
   * ============
   * 10: new
   * 20: processing (optional, may not be updated by service during processing)
   *
   * [ FINAL STATES >= 50 ]
   * 50: complete, success
   * 60: complete, rejected or failed
   */
  event NewRequest(uint256 indexed _id, address indexed _client, string _params);
  event RequestUpdate(uint256 indexed _id, uint8 _state, uint256 _balance);

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
    owner = msg.sender;
  }

  function changeManager(address _candidate) public onlyOwner {
    manager = msg.sender;
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
    RequestUpdate(id, 10, msg.value);
    requestsCount = requestsCount + 1;
    return id;
  }

  /**
   * Update request
   */
  function update(uint256 _id, uint8 _state, uint256 _balance) public onlyManagerAndOwner {
    RequestUpdate(_id, _state, _balance);
  }

  /**
   * Refund and update state to final state
   */
  function refund(uint256 _id, uint8 _state, address _client, uint256 _value) public onlyManagerAndOwner {
    // Check for final states
    if (_state < 50) {
      throw;
    }
    if (!_client.send(_value)) {
      throw;
    }

    RequestUpdate(_id, _state, 0);
  }
}

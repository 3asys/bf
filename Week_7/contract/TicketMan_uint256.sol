pragma solidity ^0.4.20;

/// @title �����-�������� ������� �������
/// @author 3asys

contract TicketMan {

    // �������:
    struct Purchase {
        address buyer; // ����� ����������
        uint ticketNum; // ����� ������
        uint place; // �����
        uint row; // ���
        uint region; // ������, ������ ���� (������, ��������, ...)
        uint sessionNum; // ����� ������
    }
    
    Purchase[] public purchasing; // ������ �� ��������� Purcase
    
    address public owner; // ����� ��������� ���������
    address candidate; // ����� ��������� � ����� ��������� ���������
    
    uint ticketPrice = 10 finney; // ���� ������ ������
    
    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }
    
    constructor () public {
        // ��������� ����� �� ������� ������ ����������� ���� �� ������:
        owner = msg.sender;
    }

    /*
    @notice ����� owner-� ���������.
    @dev ��� ������ ������� �newOwner� �� ����� �� ������ ������� �������������� �����, 
         � ������, �������� �������� ��� ����������. 
         ����� ��������� ���� ����������, ���������� ������ ��� ���� �candidate�, 
         � ��� ������ ������� �newOwner� ����� ��������� ����� �������� ������� � �candidate�, 
         � ���������� ��� � �owner� �����, ��� ������ �������� ���������� ���� ���������� � �����, 
         ������ �� ������ ������ ������� �confirmOwner� 
    */
    function newOwner(address _owner) public onlyOwner {
        require(_owner != 0x0);
        candidate = _owner;
    }
    
    // ������������� ���������� � owner-� ������ ������
    function confirmOwner() public {
        require (msg.sender == candidate);
        owner = candidate;
    }
    
    // ������� ��� ��������� ����� � ������ ������:
    function getTicket(uint _place, uint _row, uint _region,  uint _sessionNum) external payable returns(uint) {
        require(msg.value == ticketPrice); // ���� �������� ������� �����, ������� �����:
        owner.transfer(msg.value); // ��������� ����� �� ����� ��������� (� �����)
    
        // ��������� ���������� ����� ������:
        uint numOfTicket = uint256(keccak256(
            abi.encodePacked(now, msg.sender, _place, _row, _region, _sessionNum)
        ));
        
        bookIt(_place, _row, _region, _sessionNum, numOfTicket); // ��������� �����
        
        // ���������� ����� ������:
        return numOfTicket;
    }
    
    // ������������ ����:
    function bookIt(uint _place, uint _row, uint _region, uint _sessionNum, uint256 _numOfTicket) private {
        // ������� ����� ������ � �������:
        purchasing.push(Purchase(msg.sender, _numOfTicket, _place, _row, _region, _sessionNum));
    }
    
    // ������ ��������������� ����� � ����� �� ������ ������:
    function getPlace(uint _ticketNum) public view returns(uint, uint, uint, uint) {
        for(uint i = 0; i < purchasing.length; i++) {
            if(purchasing[i].ticketNum == _ticketNum) {
                return (purchasing[i].place, purchasing[i].row, purchasing[i].region, purchasing[i].sessionNum);
            }
        }
    }
    
    // ������ ���������� ��������� �������:
    function getPurchasedTicketsNum() public view returns(uint) {
        return purchasing.length;
    }
}
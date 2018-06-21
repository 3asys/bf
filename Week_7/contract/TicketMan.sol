pragma solidity ^0.4.20;

/// @title Смарт-контракт продажи билетов
/// @author 3asys

contract TicketMan {

    // Покупка:
    struct Purchase {
        address buyer; // адрес покупателя
        uint ticketNum; // Номер билета
        uint place; // Место
        uint row; // Ряд
        uint region; // Сектор, группа мест (партер, бельэтаж, ...)
        uint sessionNum; // Номер сеанса
    }
    
    Purchase[] public purchasing; // Массив из структуры Purcase
    
    address public owner; // Адрес владельца контракта
    address candidate; // Адрес кандидата в новые владельцы контракта
    
    uint ticketPrice = 10 finney; // Цена одного билета
    
    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }
    
    event getTicketNum(uint indexed ticketNum);
    
    constructor () public {
        // Указываем адрес на который должен зачисляться эфир за билеты:
        owner = msg.sender;
    }

    /*
    @notice Смена owner-а контракта.
    @dev при вызове функции «newOwner» мы можем по ошибке указать несуществующий адрес, 
         а значит, потеряем контроль над контрактом. 
         Чтобы исправить этот недостаток, достаточно ввести еще поле «candidate», 
         а при вызове функции «newOwner» будем сохранять новое значение сначала в «candidate», 
         а перемещать его в «owner» будем, как только кандидат подтвердит свое вступление в права, 
         вызвав со своего адреса функцию «confirmOwner» 
    */
    function newOwner(address _owner) public onlyOwner {
        require(_owner != 0x0);
        candidate = _owner;
    }
    
    // Подтверждение кандидатом в owner-ы своего адреса
    function confirmOwner() public {
        require (msg.sender == candidate);
        owner = candidate;
    }
    
    // Функция для получения эфира и выдачи билета:
    function getTicket(uint _place, uint _row, uint _region,  uint _sessionNum) public payable {
        require(msg.value == ticketPrice); // Если прислано столько эфира, сколько нужно:
        owner.transfer(msg.value); // Переводим плату за место владельцу (в кассу)
    
        // Вычисляем уникальный номер билета:
        uint numOfTicket = uint256(keccak256(
            abi.encodePacked(now, msg.sender, _place, _row, _region, _sessionNum)
        ));
        
        bookIt(_place, _row, _region, _sessionNum, numOfTicket); // Бронируем место
        
        emit getTicketNum(numOfTicket); // Вызываем событие getTicketNum, которое должно вернуть номер билета
        
    }
    
    // Бронирование мест:
    function bookIt(uint _place, uint _row, uint _region, uint _sessionNum, uint256 _numOfTicket) private {
        // Создаем новую запись в массиве:
        purchasing.push(Purchase(msg.sender, _numOfTicket, _place, _row, _region, _sessionNum));
    }
    
    // Узнать забронированные место и время по номеру билета:
    function getPlace(uint _ticketNum) public view returns(uint pPlace, uint pRow, uint pRegion, uint pSessionNum) {
        for(uint i = 0; i < purchasing.length; i++) {
            if(purchasing[i].ticketNum == _ticketNum) {
                pPlace = purchasing[i].place;
                pRow = purchasing[i].row;
                pRegion = purchasing[i].region;
                pSessionNum = purchasing[i].sessionNum;
            }
        }
    }
    
    // Узнать количество проданных билетов:
    function getPurchasedTicketsNum() public view returns(uint pTicketNum) {
        pTicketNum = purchasing.length;
    }
}
pragma solidity ^0.4.20;

// @title Смарт-контракт продажи билетов
// @author 3asys

contract TicketMan {

    // Покупка:
    struct Purchase {
        address buyer; // адрес покупателя
        uint buydatetime; // Дата и время покупки билета
        uint place; // Место
        uint row; // Ряд
        uint region; // Сектор, группа мест (партер, бельэтаж, ...)
        uint sessionNum; // Номер сеанса
        uint ticketprice; // Цена билета
    }
    
    Purchase[] public purchasing; // Массив из структуры Purcase
    
    mapping(bytes32 => Purchase) public ticketPlace;
    
    address public owner; // Адрес владельца контракта
    address candidate; // Адрес кандидата в новые владельцы контракта
    
    uint ticketPrice = 10 finney; // Цена одного билета
    
    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }
    
    event getTicketNum(bytes32 indexed ticketNum);
	event setCandidate(address indexed candidate);
	event setNewOwner(address indexed owner);
	event setNewPrice(uint indexed newPrice);
    
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
		emit setCandidate(candidate); // Вызываем событие назначения кандидата во владельцы контракта
    }
    
    // Подтверждение кандидатом в owner-ы своего адреса
    function confirmOwner() public {
        require (msg.sender == candidate);
        owner = candidate;
		emit setNewOwner(owner); // Вызываем событие назначения нового владельца контракта
    }
    
    // Установить цену билета:
    function setTicketPrice(uint _ticketPrice) public onlyOwner {
        ticketPrice = _ticketPrice;
		emit setNewPrice(ticketPrice);
    }
    
    // Получить цену конкретного билета:
    function verifeTicketPrice(bytes32 _ticketNum) public view returns(uint isticketPrice) {
        isticketPrice = ticketPlace[_ticketNum].ticketprice;
    }
    
    // Получить текущую цену билета:
    function getCurrentTicketPrice() public view returns(uint currentTicketPrice) {
        currentTicketPrice = ticketPrice;
    }    
    
    // Функция для получения эфира и выдачи билета:
    function getTicket(uint _place, uint _row, uint _region,  uint _sessionNum) public payable {
        require(msg.value == ticketPrice); // Если прислано столько эфира, сколько нужно:
        owner.transfer(msg.value); // Переводим плату за место владельцу (в кассу)
    
        // Вычисляем уникальный номер билета:
        bytes32 numOfTicket = keccak256(
            abi.encodePacked(now, msg.sender, _place, _row, _region, _sessionNum)
        );
        
        bookIt(_place, _row, _region, _sessionNum, numOfTicket); // Бронируем место
        
        emit getTicketNum(numOfTicket); // Вызываем событие getTicketNum, которое должно вернуть номер билета
        
    }
    
    // Бронирование мест:
    function bookIt(uint _place, uint _row, uint _region, uint _sessionNum, bytes32 _numOfTicket) private {
        ticketPlace[_numOfTicket].buyer = msg.sender;
        ticketPlace[_numOfTicket].buydatetime = now;
        ticketPlace[_numOfTicket].place = _place;
        ticketPlace[_numOfTicket].row = _row;
        ticketPlace[_numOfTicket].region = _region;
        ticketPlace[_numOfTicket].sessionNum = _sessionNum;
        ticketPlace[_numOfTicket].ticketprice = ticketPrice;		
        // Создаем новую запись в массиве:
        purchasing.push(Purchase(msg.sender, now, _place, _row, _region, _sessionNum, ticketPrice));
    }
    
    // Узнать забронированные место и время по номеру билета:
    function getPplace(bytes32 _ticketNum) public view returns(uint pPlace) {
        pPlace = ticketPlace[_ticketNum].place;
    }
    
    function getProw(bytes32 _ticketNum) public view returns(uint pRow) {
        pRow = ticketPlace[_ticketNum].row;
    }
    
    function getPregion(bytes32 _ticketNum) public view returns(uint pRegion) {
        pRegion = ticketPlace[_ticketNum].region;
    }
    
    function getPsessionNum(bytes32 _ticketNum) public view returns(uint pSessionNum) {
        pSessionNum = ticketPlace[_ticketNum].sessionNum;
    }     
    /**
    // Вариант функции с возвратом всех 4-х значений одновременно:
    function getPlace(bytes32 _ticketNum) public view returns(uint pPlace, uint pRow, uint pRegion, uint pSessionNum) {
        pPlace = ticketPlace[_ticketNum].place;
        pRow = ticketPlace[_ticketNum].row;
        pRegion = ticketPlace[_ticketNum].region;
        pSessionNum = ticketPlace[_ticketNum].sessionNum;
        //string ticketData = pPlace+" "+string(pRow)+" "+string(pRegion)+" "+string(pSessionNum);
    }    
    */
    // Узнать количество проданных билетов:
    function getPurchasedTicketsNum() public view returns(uint pTicketNum) {
        pTicketNum = purchasing.length;
    }
}
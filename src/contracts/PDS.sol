// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract PDS {

    struct _Shop{
        uint256 id;
        string name;
        address account;
        string location;
        bool exists;
    }

    struct _ItemsAvailable{
        uint256 _id;
        string name;
        uint256 price;
    }

    struct _Bag{
        uint256 id;
        string item;
    }

    enum PickupStatus { Assigned, PickedUp, Delivered, Confirmed }

    struct _RationPickup {
        uint256 id;
        address deliveryAgent;
        uint256 shopId;
        uint256[] bagIds;
        PickupStatus status;
        uint256 assignedTime;
    }

    // Historical Events
    event Transfered(
        uint256 id,
        uint256 fromId,
        uint256 toId,
        uint256[] bagIds,
        uint256 timestamp
    );
    event Received(
        uint256 id,
        uint256 fromId,
        uint256 toId,
        uint256[] bagIds,
        uint256 timestamp
    );
    event Order(
        uint256 id,
        address customerAddress,
        uint256 shopId,
        uint256[] itemIds,
        uint256[] quantities,
        uint256 timestamp
    );

    // Setup Events
    event StateAdminAdded(address admin);
    event StateAdminRemoved(address admin);
    event DistrictAdminAdded(address admin);
    event DistrictAdminRemoved(address admin);
    event ShopAdded(uint256 id, string name, address account, string location);
    event ShopRemoved(uint256 id);
    event ConsumerAdded(address consumer);
    event ConsumerRemoved(address consumer);
    event BagAdded(uint256 id, string item);
    event ItemAdded(uint256 id, string name, uint256 price);
    event ItemPriceUpdated(uint256 id, uint256 newPrice);

    // Delivery & Inventory Events
    event DeliveryAgentAdded(address agent);
    event DeliveryAgentRemoved(address agent);
    event RationPickupAssigned(uint256 pickupId, address deliveryAgent, uint256 shopId);
    event RationPickedUp(uint256 pickupId, address deliveryAgent);
    event RationDeliveredToShop(uint256 pickupId, address deliveryAgent, uint256 shopId);
    event RationReceiptConfirmed(uint256 pickupId, uint256 shopId);
    event InventoryUpdated(uint256 shopId, uint256 itemId, uint256 newQuantity);
    event LowStockAlert(uint256 shopId, uint256 itemId, uint256 currentQuantity);

    // Users memory
    address public creator;
    uint256 public quantityOfBag;

    mapping (address => bool) public stateAdmin;
    mapping (address => bool) public districtAdmin;

    mapping (uint256 => _Shop) public shops;
    mapping (address => bool) public consumer;
    mapping (uint256 => _ItemsAvailable) public items;
    mapping (uint256 => _Bag) public bags;
    
    mapping (address => bool) public deliveryAgents;
    mapping (uint256 => _RationPickup) public rationPickups;
    uint256 public nextPickupId;

    // Mapping: shopId => (itemId => quantity)
    mapping(uint256 => mapping(uint256 => uint256)) public shopInventory;
    
    uint256 public ordersCount;
    uint256 public transfersCount;
    uint256 public receivedCount;

    // Modifiers for clean access control
    modifier onlyCreator() {
        require(msg.sender == creator, "Error: Caller is not the Creator");
        _;
    }

    modifier onlyStateAdmin() {
        require(stateAdmin[msg.sender], "Error: Caller is not a State Admin");
        _;
    }

    modifier onlyDistrictAdmin() {
        require(districtAdmin[msg.sender], "Error: Caller is not a District Admin");
        _;
    }

    modifier onlyStateOrDistrictAdmin() {
        require(stateAdmin[msg.sender] || districtAdmin[msg.sender], "Error: Caller is not a State or District Admin");
        _;
    }

    modifier onlyDeliveryAgent() {
        require(deliveryAgents[msg.sender], "Error: Caller is not a Delivery Agent");
        _;
    }

    constructor(uint256 _quantityOfBag) {
        creator = msg.sender;
        quantityOfBag = _quantityOfBag;
    }

    // Adding Users
    function addStateAdmins(address _user) public onlyCreator {
        stateAdmin[_user] = true;
        emit StateAdminAdded(_user);
    }

    function removeStateAdmin(address _user) public onlyCreator {
        stateAdmin[_user] = false;
        emit StateAdminRemoved(_user);
    }

    function addDistrictAdmins(address _user) public onlyStateAdmin {
        districtAdmin[_user] = true;
        emit DistrictAdminAdded(_user);
    }

    function removeDistrictAdmin(address _user) public onlyStateAdmin {
        districtAdmin[_user] = false;
        emit DistrictAdminRemoved(_user);
    }

    function addShops(uint256 _id, string memory _name, address _recipientAddress, string memory _location) public onlyDistrictAdmin {
        require(!shops[_id].exists, "Error: Shop with this ID already exists");
        _Shop memory shop = _Shop(_id, _name, _recipientAddress, _location, true);
        shops[_id] = shop;
        emit ShopAdded(_id, _name, _recipientAddress, _location);
    }

    function removeShop(uint256 _id) public onlyDistrictAdmin {
        require(shops[_id].exists, "Error: Shop does not exist");
        shops[_id].exists = false;
        emit ShopRemoved(_id);
    }

    function addConsumer(address _user) public onlyDistrictAdmin {
        consumer[_user] = true;
        emit ConsumerAdded(_user);
    }

    function removeConsumer(address _user) public onlyDistrictAdmin {
        consumer[_user] = false;
        emit ConsumerRemoved(_user);
    }

    function addBags(uint256 _id, string memory _item) public onlyStateAdmin {
        bags[_id] = _Bag(_id, _item);
        emit BagAdded(_id, _item);
    }

    function addItems(uint256 _id, string memory _name, uint256 _price) public onlyStateAdmin {
        items[_id] = _ItemsAvailable(_id, _name, _price);
        emit ItemAdded(_id, _name, _price);
    }

    function setItems(uint256 _id, uint256 _price) public onlyStateAdmin {
        items[_id].price = _price;
        emit ItemPriceUpdated(_id, _price);
    }

    function transferedBags(uint256 _fromId, uint256 _toId, uint256[] memory _bagIds) public onlyStateOrDistrictAdmin {
        // We removed the transferHistory array to save massive amounts of gas!
        // Historical data is now fully handled by emitting events.
        transfersCount++;
        emit Transfered(transfersCount, _fromId, _toId, _bagIds, block.timestamp);
    }

    function receivedBags(uint256 _fromId, uint256 _toId, uint256[] memory _bagIds) public {
        require(
            districtAdmin[msg.sender] || (shops[_toId].exists && shops[_toId].account == msg.sender),
            "Error: Caller must be a District Admin or the registered Shop owner"
        );
        
        // We removed the receivedHistory array to save massive amounts of gas!
        receivedCount++;
        emit Received(receivedCount, _fromId, _toId, _bagIds, block.timestamp);
    }

    function orderMade(address _customer, uint256 _shopId, uint256[] memory _itemIds, uint256[] memory _quantities) public {
        require(shops[_shopId].exists, "Error: Shop does not exist");
        require(shops[_shopId].account == msg.sender, "Error: Caller is not the Shop Owner");
        require(consumer[_customer], "Error: Customer is not a registered Consumer");
        require(_itemIds.length == _quantities.length, "Error: Item IDs and quantities must have the same length");
        require(_itemIds.length > 0, "Error: Order must contain at least one item");

        // We removed the orders array to save massive amounts of gas!
        ordersCount++;
        emit Order(ordersCount, _customer, _shopId, _itemIds, _quantities, block.timestamp);
    }

    // ============ DELIVERY AGENT FUNCTIONS ============

    function addDeliveryAgent(address _user) public onlyStateAdmin {
        deliveryAgents[_user] = true;
        emit DeliveryAgentAdded(_user);
    }

    function removeDeliveryAgent(address _user) public onlyStateAdmin {
        deliveryAgents[_user] = false;
        emit DeliveryAgentRemoved(_user);
    }

    function assignRationPickup(address _deliveryAgent, uint256 _shopId, uint256[] memory _bagIds) public onlyStateAdmin {
        require(deliveryAgents[_deliveryAgent], "Error: Invalid delivery agent");
        require(shops[_shopId].exists, "Error: Invalid shop");

        nextPickupId++;
        rationPickups[nextPickupId] = _RationPickup({
            id: nextPickupId,
            deliveryAgent: _deliveryAgent,
            shopId: _shopId,
            bagIds: _bagIds,
            status: PickupStatus.Assigned,
            assignedTime: block.timestamp
        });

        emit RationPickupAssigned(nextPickupId, _deliveryAgent, _shopId);
    }

    function markRationPickedUp(uint256 _pickupId) public onlyDeliveryAgent {
        require(rationPickups[_pickupId].deliveryAgent == msg.sender, "Error: Not assigned to you");
        require(rationPickups[_pickupId].status == PickupStatus.Assigned, "Error: Invalid status");

        rationPickups[_pickupId].status = PickupStatus.PickedUp;
        emit RationPickedUp(_pickupId, msg.sender);
    }

    function markRationDelivered(uint256 _pickupId) public onlyDeliveryAgent {
        require(rationPickups[_pickupId].deliveryAgent == msg.sender, "Error: Not assigned to you");
        require(rationPickups[_pickupId].status == PickupStatus.PickedUp, "Error: Must pick up first");

        rationPickups[_pickupId].status = PickupStatus.Delivered;
        emit RationDeliveredToShop(_pickupId, msg.sender, rationPickups[_pickupId].shopId);
    }

    function confirmRationReceipt(uint256 _pickupId) public {
        uint256 shopId = rationPickups[_pickupId].shopId;
        require(shops[shopId].account == msg.sender, "Error: Caller is not the Shop Owner");
        require(rationPickups[_pickupId].status == PickupStatus.Delivered, "Error: Not delivered yet");

        rationPickups[_pickupId].status = PickupStatus.Confirmed;
        emit RationReceiptConfirmed(_pickupId, shopId);
    }

    // ============ INVENTORY MANAGEMENT ============

    function updateShopInventory(uint256 _shopId, uint256 _itemId, uint256 _quantity) public {
        require(shops[_shopId].account == msg.sender || stateAdmin[msg.sender], "Error: Unauthorized");
        require(items[_itemId]._id == _itemId, "Error: Item does not exist");

        shopInventory[_shopId][_itemId] = _quantity;
        emit InventoryUpdated(_shopId, _itemId, _quantity);

        if (_quantity < 10) { // Arbitrary low stock threshold
            emit LowStockAlert(_shopId, _itemId, _quantity);
        }
    }

}
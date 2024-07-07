// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Ownable {
    address public owner;

    event OwnershipTransferred(address previousOwner, address newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        owner = newOwner;

        emit OwnershipTransferred(owner, newOwner);
    }
}


enum Vote {
    NONE,
    UP,
    DOWN
}

struct Clone {
    address owner;
    string img_hash;
    string[] kb_hash;
    uint256 price; // price per second (in wei)
    int16 rating;

    string name;
    string description;

    bool is_active;
    uint256 id;
}

contract Cyclone is Ownable {
    mapping (uint256 => Clone) public clones; // clone_id => Clone
    mapping (address => mapping (uint256 => uint256)) public subscriptions; // subscriber => clone_id => end_time (FIXME: should be int32 to save gas)
    mapping (address => uint256) public balances; // owner => balance : profit from subscriptions
    mapping (address => mapping (uint256 => Vote)) public votes; // reviewer => clone_id => reviewed

    uint256 public clone_id = 0; // auto increment (max clone_id)
    uint256 public fee = 10; // Service fee (in basis points, 1% = 100)
    uint256 public constant FEE_DENOMINATOR = 100_00;

    event CloneCreated(uint256 clone_id, address owner, string img_hash, string[] kb_hash, uint256 price, string name, string description);
    event CloneActivated(uint256 clone_id, bool is_active);
    event CloneImgUpdated(uint256 clone_id, string img_hash);
    event CloneKbAdded(uint256 clone_id, string kb_hash);
    event CloneKbRemoved(uint256 clone_id, uint256 index);
    event CloneDescriptionUpdated(uint256 clone_id, string description);
    event ClonePriceUpdated(uint256 clone_id, uint256 price);
    event Subscription(address subscriber, uint256 clone_id, uint256 duration);
    event VoteCasted(address voter, uint256 clone_id, Vote vote);
    event FeeSet(uint256 fee);
    event ContractFeesWithdrawn(uint256 amount);
    event BalanceClaimed(address owner, uint256 amount);



    constructor() {
        owner = msg.sender;
    }


    function _takeFee(uint256 amount) internal returns (uint256) {
        require(amount > 1_000_000, "Cyclone: amount must be greater than 0"); // overflow check

        uint256 feeAmount = amount * fee / FEE_DENOMINATOR;
        balances[owner] += feeAmount;
        return amount - feeAmount;
    }

    function setFee(uint256 _fee) public onlyOwner {
        require(_fee <= 100, "Cyclone: fee must be less than 1%");
        fee = _fee;

        emit FeeSet(fee);
    }

    function withdrawContractFees() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Cyclone: no balance to withdraw");

        payable(owner).transfer(amount);

        emit ContractFeesWithdrawn(amount);
    }



    function createClone(
        string memory img_hash, string[] memory kb_hash, uint256 price, string memory name, string memory description
        ) public returns (uint256)
    {
        require(price > 0, "Cyclone: price must be greater than 0");

        clones[clone_id] = Clone(msg.sender, img_hash, kb_hash, price, 0, name, description, true, clone_id);
        clone_id++;

        emit CloneCreated(clone_id - 1, msg.sender, img_hash, kb_hash, price, name, description);
        return clone_id - 1;
    }

    function activateClone(uint256 _clone_id, bool _activate) public {
        require(
            (clones[_clone_id].owner == msg.sender) || (msg.sender == owner),
            "Cyclone: caller is not the owner of the clone"
        );

        clones[_clone_id].is_active = _activate;

        emit CloneActivated(_clone_id, _activate);
    }



    function setImg(uint256 _clone_id, string memory img_hash) public {
        require(
            (clones[_clone_id].owner == msg.sender) || (msg.sender == owner),
            "Cyclone: caller is not the owner of the clone"
        );

        clones[_clone_id].img_hash = img_hash;

        emit CloneImgUpdated(_clone_id, img_hash);
    }

    function addKb(uint256 _clone_id, string memory kb_hash) public {
        require(
            (clones[_clone_id].owner == msg.sender) || (msg.sender == owner),
            "Cyclone: caller is not the owner of the clone"
        );

        clones[_clone_id].kb_hash.push(kb_hash);

        emit CloneKbAdded(_clone_id, kb_hash);
    }

    function removeKb(uint256 _clone_id, uint256 index) public {
        Clone storage clone = clones[_clone_id];
        require(
            (clone.owner == msg.sender) || (msg.sender == owner),
            "Cyclone: caller is not the owner of the clone"
        );
        require(index < clone.kb_hash.length, "Cyclone: index out of bounds");

        // gas 
        if (index < clone.kb_hash.length - 1) {
            clone.kb_hash[index] = clone.kb_hash[clone.kb_hash.length - 1];
        }
        clone.kb_hash.pop();

        emit CloneKbRemoved(_clone_id, index);
    }

    function setDescription(uint256 _clone_id, string memory description) public {
        require(
            (clones[_clone_id].owner == msg.sender) || (msg.sender == owner),
            "Cyclone: caller is not the owner of the clone"
        );

        clones[_clone_id].description = description;

        emit CloneDescriptionUpdated(_clone_id, description);
    }

    function setPrice(uint256 _clone_id, uint256 price) public {
        require(
            (clones[_clone_id].owner == msg.sender) || (msg.sender == owner),
            "Cyclone: caller is not the owner of the clone"
        );

        clones[_clone_id].price = price;

        emit ClonePriceUpdated(_clone_id, price);
    }





    function subscribe(uint256 _clone_id, uint256 duration) public payable {
        require(clones[_clone_id].owner != address(0), "Cyclone: clone does not exist");
        require(clones[_clone_id].is_active, "Cyclone: clone is not active");
        require(msg.value == clones[_clone_id].price * duration, "Cyclone: incorrect payment amount");

        balances[clones[_clone_id].owner] += _takeFee(msg.value);

        subscriptions[msg.sender][_clone_id] < block.timestamp ?
            subscriptions[msg.sender][_clone_id] = block.timestamp + duration : subscriptions[msg.sender][_clone_id] += duration;

        emit Subscription(msg.sender, _clone_id, duration);
    }

    function claim() public {
        require(balances[msg.sender] > 0, "Cyclone: no balance to withdraw");
        require(address(this).balance >= balances[msg.sender], "Cyclone: contract balance is insufficient");

        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit BalanceClaimed(msg.sender, amount);
    }

    function vote(uint256 _clone_id, Vote _vote) public {
        require(subscriptions[msg.sender][_clone_id] > block.timestamp, "Cyclone: not subscribed to this clone");
        require(
            (votes[msg.sender][_clone_id] != Vote.UP) && (votes[msg.sender][_clone_id] != Vote.DOWN),
            "Cyclone: already voted"
        );
        require(_vote != Vote.NONE, "Cyclone: invalid vote");

        if (_vote == Vote.UP) {
            clones[_clone_id].rating++;
        } else {
            clones[_clone_id].rating--;
        }

        votes[msg.sender][_clone_id] = _vote;

        emit VoteCasted(msg.sender, _clone_id, _vote);
    }


    function getSubscriptionExpiration(uint256 _clone_id) public view returns (uint256) {
        return subscriptions[msg.sender][_clone_id];
    }

    function getCloneKbHash(uint256 cloneId) public view returns (string[] memory) {
        return clones[cloneId].kb_hash;
    }
}


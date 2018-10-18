pragma solidity ^0.4.23;

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

contract KURO {
    using SafeMath for uint256;

    string public constant name = "kuro";
    string public constant symbol = "KURO";

    address public SHIRO;
    bytes4 public spendABI = bytes4(keccak256("spend(address,uint256)"));

    address public founder;

    mapping (uint256 => address) internal tokenOwner;
    mapping (uint256 => address) internal tokenApprovals;
    mapping (address => uint256) internal ownedTokensCount;

    mapping (address => mapping (address => bool)) internal operatorApprovals;

    mapping (uint256 => uint256) internal tokenIndexforOwner;
    mapping (address => mapping (uint256 => uint256)) internal ownerTokensList;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _tokenId
    );
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 _tokenId
    );
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );

    constructor () public {
        founder = msg.sender;
    }

    modifier onlyOwnerOf(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Unauthorized address");
        _;
    }
  
    modifier canTransfer(uint256 _tokenId) {
        require(isApprovedOrOwner(msg.sender, _tokenId), "Unauthorized address");
        _;
    }

    function setSHIRO(address _shiro) public {
        require(founder == msg.sender, "Unauthorized address");
        SHIRO = _shiro;
    }
  
    function balanceOf(address _owner) public view returns (uint256) {
        require(_owner != address(0), "Invalid address");
        return ownedTokensCount[_owner];
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        address owner = tokenOwner[_tokenId];
        require(owner != address(0), "Invalid address");
        return owner;
    }

    function exists(uint256 _tokenId) public view returns (bool) {
        address owner = tokenOwner[_tokenId];
        return owner != address(0);
    }

    function approve(address _to, uint256 _tokenId) public {
        address owner = ownerOf(_tokenId);
        require(_to != owner, "The target address can not be self");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "Unauthorized");

        if (getApproved(_tokenId) != address(0) || _to != address(0)) {
            tokenApprovals[_tokenId] = _to;
            emit Approval(owner, _to, _tokenId);
        }
    }

    function getApproved(uint256 _tokenId) public view returns (address) {
        return tokenApprovals[_tokenId];
    }

    function setApprovalForAll(address _to, bool _approved) public {
        require(_to != msg.sender, "Invalid address");
        operatorApprovals[msg.sender][_to] = _approved;
        emit ApprovalForAll(msg.sender, _to, _approved);
    }

    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return operatorApprovals[_owner][_operator];
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public canTransfer(_tokenId) {
        require(_from != address(0), "Invalid from address");
        require(_to != address(0), "Invalid to address");

        clearApproval(_from, _tokenId);
        removeTokenFrom(_from, _tokenId);
        addTokenTo(_to, _tokenId);

        emit Transfer(_from, _to, _tokenId);
    }

    function isApprovedOrOwner(address _spender, uint256 _tokenId) internal view returns (bool) {
        address owner = ownerOf(_tokenId);
        return (
            _spender == owner || getApproved(_tokenId) == _spender || isApprovedForAll(owner, _spender)
        );
    }

    function getNewToken() public {
        require(SHIRO.call(spendABI, msg.sender, 648), "Failure to deduct money");
        bytes32 lastBlockHash = blockhash(block.number.sub(1));
        uint256 tokenId = uint256(keccak256(abi.encodePacked(msg.sender, lastBlockHash, block.coinbase)));
        _mint(msg.sender, tokenId);
    }

    function getOwnerTokens(address _to, uint start, uint end) public view returns (uint[]) {
        require(_to != address(0), "Invalid address");
        require(start > 0, "Start must greater than zero");
        require(end.add(1).sub(start) <= 30, "Maximum query 30 records");
        require(start <= end, "End can not less then start");
        require(end <= ownedTokensCount[_to], "End exceeds the upper limit");
        uint[] memory tokens = new uint[](end.add(1).sub(start));
        for (uint i = start; i <= end; i++)
            tokens[i - start] = ownerTokensList[_to][i];
        return tokens;
    }

    function _mint(address _to, uint256 _tokenId) internal {
        require(_to != address(0), "Invalid address");
        addTokenTo(_to, _tokenId);
        emit Transfer(address(0), _to, _tokenId);
    }

    function _burn(address _owner, uint256 _tokenId) internal {
        clearApproval(_owner, _tokenId);
        removeTokenFrom(_owner, _tokenId);
        emit Transfer(_owner, address(0), _tokenId);
    }

    function clearApproval(address _owner, uint256 _tokenId) internal {
        require(ownerOf(_tokenId) == _owner, "Unauthorized address");
        if (tokenApprovals[_tokenId] != address(0)) {
            tokenApprovals[_tokenId] = address(0);
            emit Approval(_owner, address(0), _tokenId);
        }
    }

    function addTokenTo(address _to, uint256 _tokenId) internal {
        require(tokenOwner[_tokenId] == address(0), "Nonexistent token");
        tokenOwner[_tokenId] = _to;
        uint countNow = ownedTokensCount[_to].add(1);
        ownerTokensList[_to][countNow] = _tokenId;
        tokenIndexforOwner[_tokenId] = countNow;
        ownedTokensCount[_to] = countNow;
    }

    function removeTokenFrom(address _from, uint256 _tokenId) internal {
        require(ownerOf(_tokenId) == _from, "Nonexistent token");

        uint index = tokenIndexforOwner[_tokenId];
        uint countBefore = ownedTokensCount[_from];
        uint lastToken = ownerTokensList[_from][countBefore];

        ownerTokensList[_from][index] = lastToken;
        tokenIndexforOwner[lastToken] = index;

        delete ownerTokensList[_from][countBefore];
        delete tokenIndexforOwner[_tokenId];

        ownedTokensCount[_from] = countBefore.sub(1);
        tokenOwner[_tokenId] = address(0);
    }
}

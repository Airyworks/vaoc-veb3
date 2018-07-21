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

contract SHIRO {
    using SafeMath for uint256;
    
    string public constant name = "shiro";
    string public constant symbol = "SHIRO";
    uint256 public constant decimals = 0;
    uint256 _totalSupply = 100000000 * 10 ** decimals;
    address public founder;
    uint256 public distributed;

    mapping (address => uint256) internal balances;
	
    mapping (address => mapping (address => uint256)) internal allowed;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor() public {
        founder = msg.sender;
    }

    function totalSupply() view public returns (uint256 supply) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require (_to != address(0));

        require(balances[msg.sender] >= _value);
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function spend(address _from, uint _value) public {
        require(balances[_from] >= _value);
        balances[_from] = balances[_from].sub(_value);
        distributed = distributed.sub(_value);
        emit Transfer(_from, address(0), _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require (_to != address(0));

        require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value);
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) view public returns (uint256) {
        return allowed[_owner][_spender];
    }

    function distribute(address _to, uint256 _amount) public returns (bool) {
        require(msg.sender == founder);
        require(distributed.add(_amount) <= _totalSupply);

        distributed = distributed.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        emit Transfer(this, _to, _amount);
        return true;
    }
	
    function distributeMultiple(address[] _tos, uint256[] _values) public returns (bool) {
        require(msg.sender == founder);
		
        uint256 total = 0;
        uint256 i = 0; 
        for (i = 0; i <= _tos.length; i++) {
            total = total.add(_values[i]);
        }

        require(distributed.add(total) < _totalSupply);

        for (i = 0; i <= _tos.length; i++) {
            distributed = distributed.add(_values[i]);
            balances[_tos[i]] = balances[_tos[i]].add(_values[i]);
            emit Transfer(this, _tos[i], _values[i]);
        }
        return true;
    }

    function changeFounder(address newFounder) public {
        require(msg.sender == founder);

        founder = newFounder;
    }
}
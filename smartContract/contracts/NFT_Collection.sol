// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IWhitelist {
    function whiteListAddresses(address) external view returns (bool);
}

contract NFT_Collection is ERC721Enumerable, Ownable {
    IWhitelist whitelist_contract;

    string baseURI;

    uint256 public maxtokenIds = 20;

    uint256 public tokenIds;

    uint256 token_price = 0.01 ether;

    bool public preSaleStarted;

    uint256 public preSaleEnded;

    constructor(address _whitelist, string memory _baseUri)
        ERC721("CryptoRain", "CTR")
    {
        whitelist_contract = IWhitelist(_whitelist);
        baseURI = _baseUri;
    }

    modifier onlyWhitelist() {
        require(
            whitelist_contract.whiteListAddresses(msg.sender),
            "you are not whitelisted"
        );
        _;
    }

    function startPreSale() public onlyOwner {
        preSaleStarted = true;
        preSaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhitelist {
        require(
            preSaleStarted && block.timestamp < preSaleEnded,
            "sale not started"
        );
        require(msg.value >= token_price, "not enough ether to mint");
        require(tokenIds < maxtokenIds, "maximum tokens minted");
        _safeMint(msg.sender, tokenIds);
        tokenIds++;
    }

    function publicMint() public payable {
        require(
            preSaleStarted && block.timestamp > preSaleEnded,
            "public sale not started"
        );
        require(msg.value >= token_price, "not enough ether to mint");
        require(tokenIds < maxtokenIds, "maximum tokens minted");
        _safeMint(msg.sender, tokenIds);
        tokenIds++;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "failed to withdraw");
    }

    receive() external payable {}

    fallback() external payable {}
}

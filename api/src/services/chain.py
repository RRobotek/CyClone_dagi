from web3 import Web3
from typing import List

from services.ipfs import get
#from ipfs import get


RPC_URL = "https://eth-sepolia.api.onfinality.io/public"
CONTRACT_ADDRESS = "0xdF807873B50534Ef5Dca4C589f3DC48E0814526A"
CONTRACT_ABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "FEE_DENOMINATOR", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "bool", "name": "_activate", "type": "bool" } ], "name": "activateClone", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "string", "name": "kb_hash", "type": "string" } ], "name": "addKb", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "balances", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "clone_id", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "clones", "outputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "string", "name": "img_hash", "type": "string" }, { "internalType": "uint256", "name": "price", "type": "uint256" }, { "internalType": "int16", "name": "rating", "type": "int16" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "bool", "name": "is_active", "type": "bool" }, { "internalType": "uint256", "name": "id", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "img_hash", "type": "string" }, { "internalType": "string[]", "name": "kb_hash", "type": "string[]" }, { "internalType": "uint256", "name": "price", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" } ], "name": "createClone", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "cloneId", "type": "uint256" } ], "name": "getCloneKbHash", "outputs": [ { "internalType": "string[]", "name": "", "type": "string[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" } ], "name": "getSubscriptionExpiration", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "removeKb", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "string", "name": "description", "type": "string" } ], "name": "setDescription", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_fee", "type": "uint256" } ], "name": "setFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "string", "name": "img_hash", "type": "string" } ], "name": "setImg", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "uint256", "name": "price", "type": "uint256" } ], "name": "setPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "uint256", "name": "duration", "type": "uint256" } ], "name": "subscribe", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "subscriptions", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_clone_id", "type": "uint256" }, { "internalType": "enum Vote", "name": "_vote", "type": "uint8" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "votes", "outputs": [ { "internalType": "enum Vote", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "withdrawContractFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]

w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    raise Exception("Failed to connect to RPC URL")

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

def get_kb_hashes(clone_id) -> List[str]:
    kb_hashes: List[str] = contract.functions.getCloneKbHash(clone_id).call()
    return kb_hashes

def get_kb(clone_id) -> List[str]:
    kb_hashes = get_kb_hashes(clone_id)
    kbs = []
    for kb_hash in kb_hashes:
        kbs.append(get(kb_hash))

    return kbs

def get_img_hash(clone_id) -> str:
    return contract.functions.clones(clone_id).call()[1]

def get_img_url(clone_id) -> str:
    _hash = get_img_hash(clone_id)
    return f"https://ipfs.io/ipfs/{_hash}"





if __name__ == "__main__":
    #print(get_kb(0))

    print(get_img_url(0))




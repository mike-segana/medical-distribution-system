import hashlib
import os
import time
from web3 import Web3
from dotenv import load_dotenv
import json

load_dotenv()

INFURA_URL = os.getenv("INFURA_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
#CONTRACT_ABI = eval(os.getenv("CONTRACT_ABI_JSON"))
CONTRACT_ABI = json.loads(os.getenv("CONTRACT_ABI_JSON"))
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ACCOUNT_ADDRESS")

w3 = Web3(Web3.HTTPProvider(INFURA_URL))
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)

def log_operation(doctor_id: int, patient_id: int, operation: str):
    timestamp = int(time.time())
    data_string = f"{doctor_id}:{patient_id}:{operation}:{timestamp}"
    data_hash = hashlib.sha256(data_string.encode()).hexdigest()

    nonce = w3.eth.get_transaction_count(ACCOUNT_ADDRESS)

    txn = contract.functions.logData(data_hash).build_transaction({
        'from': ACCOUNT_ADDRESS,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    #tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return tx_hash.hex()
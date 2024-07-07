import os
import requests
from pinatapy import PinataPy

#PINATA_API_KEY = os.getenv("PINATA_API_KEY")
#PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")

PINATA_API_KEY=""
PINATA_API_SECRET=""


def upload(file_path: str):
    pinata = PinataPy(PINATA_API_KEY, PINATA_API_SECRET)

    r = pinata.pin_file_to_ipfs(
        path_to_file=file_path,
        save_absolute_paths=False,
        #ipfs_destination_path="/"
    )

    if r.get("IpfsHash"):
        return r["IpfsHash"]
    else:
        return None


def get(ipfs_hash: str):
    r = requests.get(f"https://ipfs.io/ipfs/{ipfs_hash}")

    if r.status_code == 200:
        return r.content
    else:
        return None

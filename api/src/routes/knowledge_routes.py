
import logging

from sqlalchemy.orm import Session

#from models.database_models import *
#from models.pydantic_models import *
from services.ipfs import upload

#from database.dependencies import get_db, get_current_user


import os
import io
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import random


from constants import MASTER_KEY


router = APIRouter()


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

@router.post("/")
async def add_knowledge(
    file: UploadFile = File(...), 
):
    allowed_types = [".txt", ".pdf", ".doc", ".docx", ".md", ".html", ".htm"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    file_content = await file.read()

    # save the file contents to temporary file
    _tmp = f"/tmp/kb_cyclone_{random.randint(0, 100000000)}{file_ext}"
    with open(_tmp, "wb") as f:
        f.write(file_content)
    ipfs_hash = upload(_tmp)
    
    # remove the temporary file
    os.remove(_tmp)

    if ipfs_hash:
        return {"ipfs_hash": ipfs_hash}
    else:
        raise HTTPException(status_code=500, detail="Failed to upload file to IPFS")
    

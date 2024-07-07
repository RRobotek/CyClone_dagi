import logging
from sqlalchemy.orm import Session



from services.ipfs import upload

import os
from fastapi import APIRouter, File, UploadFile, HTTPException
import random





router = APIRouter()


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())


@router.post("/")
async def add_image(file: UploadFile = File(...)):
    try:
        allowed_types = [".jpg", ".jpeg", ".png"]

        file_ext = os.path.splitext(file.filename)[1].lower()

        
        if file_ext not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not allowed. Only .jpg, .jpeg, and .png are accepted.")
        
        file_content = await file.read()

        
        # save the file contents to temporary file
        _tmp = f"/tmp/img_cyclone_{random.randint(0, 100000000)}{file_ext}"

        with open(_tmp, "wb") as f:
            f.write(file_content)

        ipfs_hash = upload(_tmp)

        
        # remove the temporary file
        os.remove(_tmp)
        if ipfs_hash:
            return {"ipfs_hash": ipfs_hash}
        else:
            raise HTTPException(status_code=500, detail="Failed to upload file to IPFS")
    except Exception as e:
        print(f"Error in add_image: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

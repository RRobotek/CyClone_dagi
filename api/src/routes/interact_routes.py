#_user: str = Depends(get_current_user)
import logging
from sqlalchemy.orm import Session

#from models.database_models import *
#from models.pydantic_models import *
#from database.dependencies import get_db, get_current_user

from services import interact as ai
from services import chain

import os
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
import random
import json







router = APIRouter()


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())


@router.get("/{clone_id}/{prompt}/")
async def interact_main( clone_id: int, prompt: str):
    kbs = chain.get_kb(clone_id)

    if not kbs:
        raise HTTPException(status_code=404, detail="Clone not found")
    
    # merge kbs

    # DEBUG
    # kb = "you like turtles"

    for k in kbs:
        kb += k.decode("utf-8")
    if len(kb) > 3000:
        kb = kb[:3000]
    system_prompt = f"For context, here is what you know:\n\n{kb}\n\nNow, please provide a response to the following prompt:\n\n{prompt}"

    img_url = chain.get_img_url(clone_id)

    response = ai.prompt_gpt4(system_text=system_prompt, message=prompt)
    audio_url = ai.text_to_speech(response)
    video_url = ai.speech_to_lipsync(audio_url, img_url, model="SadTalker")

    #audio_url = ""
    #video_url = ""

    return {"text": response, "audio": audio_url, "video": video_url}

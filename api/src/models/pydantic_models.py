from pydantic import BaseModel

class ChallengeData(BaseModel):
    account: str

class LoginData(BaseModel):
    account: str
    signature: str
    challenge: str

class ImageMetadata(BaseModel):
    clone_id: int
    file_size: int
    file_name: str
    file_type: str
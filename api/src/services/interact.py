import os
import time

import replicate
import openai


def text_to_speech(text: str) -> str:
    output = replicate.run(
        "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input={
            "text": text,
            "speaker": "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav",
            "language": "en",
            "cleanup_voice": False
        }
    )

    return output


def speech_to_lipsync(audio_path: str, img_path: str, model: str = "wav2lip") -> str:
    if model == "wav2lip":
        output = replicate.run(
            "devxpy/cog-wav2lip:8d65e3f4f4298520e079198b493c25adfc43c058ffec924f2aefc8010ed25eef",
            input={
                "fps": 25,
                "face": img_path,
                "pads": "0 10 0 0",
                "audio": audio_path,
                "smooth": True,
                "resize_factor": 1
            }
        )

    else:
        output = replicate.run(
            "cjwbw/sadtalker:a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3",
            input={
                "facerender": "facevid2vid",
                "pose_style": 0,
                "preprocess": "crop",
                "still_mode": True,
                "driven_audio": audio_path,
                "source_image": img_path,
                "use_enhancer": True,
                "use_eyeblink": True,
                "size_of_image": 256,
                "expression_scale": 1
            }
        )

    return output




openai.organization = OPENAI_ORG
openai.api_key = OPENAI_API_KEY 

def prompt_gpt4(message, system_text="You are a helpfull assistant"):
    comp = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": f"{system_text}"},
                  {"role": "user", "content": f"{message}"}],
        max_tokens=200,
    )
    return comp.choices[0].message.content

def prompt_turbo(message, system_text="You are a helpfull assistant"):
    comp = openai.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        messages=[{"role": "system", "content": f"{system_text}"},
                  {"role": "user", "content": f"{message}"}],
        max_tokens=200,
    )
    return comp.choices[0].message.content



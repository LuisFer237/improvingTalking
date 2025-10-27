from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from services.transcription_service import TranscriptionService
import shutil 
from kokoro import KPipeline
import soundfile as sf
import os

app = FastAPI()
transcription_service = TranscriptionService()

pipeline = KPipeline(lang_code='a') 

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message" : "Hello api"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    
    #  Save the uploaded file temporarily
    temp_file_path = f"temp_{file.filename}"
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Call the transcription function
    result = transcription_service.transcribe(temp_file_path)
    
    return result
    
@app.post("/tts")
async def tts(text: str = Form(...)):
    generator = pipeline(text, voice='af_heart')
    audio_path = "output.wav"
    for i, (_,_, audio) in enumerate(generator):
        sf.write(audio_path, audio, 24000)
        break
    
    return FileResponse(audio_path, media_type="audio/wav", filename="output.wav")
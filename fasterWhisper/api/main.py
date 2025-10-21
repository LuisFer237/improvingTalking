from fastapi import FastAPI, UploadFile, File
from services.transcription_service import TranscriptionService
import shutil 

app = FastAPI()
transcription_service = TranscriptionService()

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
    
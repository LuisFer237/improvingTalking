from faster_whisper import WhisperModel

    
class TranscriptionService:
    def __init__(self, model_size="small"):
        self.model = WhisperModel(model_size, device="cpu", compute_type="int8")
        
    def transcribe(self, audio_path):
        
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        text = " ".join([segment.text for segment in segments])
        
        return {
            "text": text,
            "languaje": info.language
        }


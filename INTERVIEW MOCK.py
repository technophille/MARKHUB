import os
import json
import traceback
import tempfile
import edge_tts
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace this string with your newly generated Groq API key (starts with 'gsk_')
api_key = "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" 
groq_client = Groq(api_key=api_key)

SYSTEM_PROMPT = """You are a senior technical hiring manager. 
Ask one interview question at a time. Keep responses under 2 sentences. 
If the candidate's answer lacks technical depth, ask a challenging follow-up. Do not sugarcoat."""

MAX_TURNS = 5  # The interview ends after 5 candidate answers

@app.websocket("/ws/interview")
async def interview_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(">>> [SUCCESS] FRONTEND CONNECTED TO WEBSOCKET")
    chat_history = [{"role": "system", "content": SYSTEM_PROMPT}]
    turn_count = 0
    
    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            
            if len(audio_bytes) < 100:
                continue

            turn_count += 1
            await websocket.send_text(json.dumps({"type": "transcript", "speaker": "System", "text": f"Processing turn {turn_count}/{MAX_TURNS}..."}))

            temp_audio_path = ""
            try:
                # 1. Transcribe
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                    temp_audio.write(audio_bytes)
                    temp_audio_path = temp_audio.name

                with open(temp_audio_path, "rb") as file:
                    transcription = groq_client.audio.transcriptions.create(
                        file=(temp_audio_path, file.read()),
                        model="whisper-large-v3-turbo"
                    )
                user_text = transcription.text
                os.remove(temp_audio_path)

                if not user_text.strip():
                    turn_count -= 1 # Don't count empty audio as a turn
                    continue

                await websocket.send_text(json.dumps({"type": "transcript", "speaker": "Candidate", "text": user_text}))
                chat_history.append({"role": "user", "content": user_text})

                # 2. Force Conclusion on Max Turns
                if turn_count >= MAX_TURNS:
                    chat_history.append({
                        "role": "system", 
                        "content": "This is the final turn. Thank the candidate for their time and conclude the interview. DO NOT ask any more questions."
                    })

                # 3. Generate AI Response
                completion = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=chat_history,
                    temperature=0.6,
                    max_tokens=150
                )
                
                ai_text = completion.choices[0].message.content
                chat_history.append({"role": "assistant", "content": ai_text})

                await websocket.send_text(json.dumps({"type": "transcript", "speaker": "Interviewer", "text": ai_text}))

                # 4. Generate TTS Audio
                tts_audio_path = tempfile.mktemp(suffix=".mp3")
                communicate = edge_tts.Communicate(ai_text, "en-US-AndrewMultilingualNeural")
                await communicate.save(tts_audio_path)

                with open(tts_audio_path, "rb") as audio_file:
                    await websocket.send_bytes(audio_file.read())
                os.remove(tts_audio_path)

                # 5. Generate Final Report if Interview is Over
                if turn_count >= MAX_TURNS:
                    await websocket.send_text(json.dumps({"type": "transcript", "speaker": "System", "text": "Interview complete. Generating brutal performance analysis..."}))
                    
                    analysis_prompt = """You are a brutally honest senior tech reviewer. Analyze the interview transcript. Do not sugarcoat anything. Output ONLY a strict JSON object with these exact keys: 
                    "technical_score" (int 1-10), "communication_score" (int 1-10), "strengths" (list of strings), "critical_weaknesses" (list of strings, highlight missing knowledge), "study_roadmap" (list of specific technical topics to study)."""
                    
                    analysis_messages = [{"role": "system", "content": analysis_prompt}] + chat_history
                    
                    analysis_completion = groq_client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=analysis_messages,
                        response_format={"type": "json_object"}
                    )
                    
                    analysis_data = json.loads(analysis_completion.choices[0].message.content)
                    
                    # Send the JSON payload to the frontend
                    await websocket.send_text(json.dumps({"type": "analysis", "payload": analysis_data}))
                    
                    # Close the socket cleanly
                    await websocket.close()
                    break

            except Exception as inner_e:
                print(f"!!! CRASH: {str(inner_e)}")
                traceback.print_exc()
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)

    except WebSocketDisconnect:
        print(">>> FRONTEND DISCONNECTED")
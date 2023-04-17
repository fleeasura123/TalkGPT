# TALK GPT
Just a fun project to talk to ChatGPT with voice using your country or native language and ChatGPT will also reply with voice (english).

This project uses https://github.com/fleeasura123/ChatGPTToAPIv1 act as a ChatGPT API

# Requirements
* This project uses https://github.com/Const-me/Whisper implementation of OpenAI Whisper, your computer must meet the requirements in the said repository

# File Requirements
* Download ```ggml-medium.bin``` at https://huggingface.co/datasets/ggerganov/whisper.cpp/tree/main and put the file inside the WhisperAI folder

# HOW TO INSTALL

1. Install ChatGPT To API (https://github.com/fleeasura123/ChatGPTToAPIv1)

2. Install SoX
- Windows - https://sourceforge.net/projects/sox/files/latest/download
- MacOS - brew install sox
- Linux - sudo apt-get install sox libsox-fmt-all

3. RUN ```npm install```

4. RUN ```npm start```

5. Login to your ElevenLabs free account

6. Go to Speech Synthesis (https://beta.elevenlabs.io/speech-synthesis)

7. Make sure that ```Generate``` button is visible

8. Don't minimize the app browser

# HOW TO USE

* Press ```F5``` to start recording, wait after ```I'm listening``` voice ends before talking.
* Press ```F5``` again to stop recording
* Wait for a response
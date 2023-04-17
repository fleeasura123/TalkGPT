(async () => {

    // Needed for global keyboard hook
    const { app, globalShortcut } = require('electron');

    /**
     * Files
     */
    const fs = require('fs');
    const { dirname } = require('path');
    const appDirectoryPath = dirname(require.main.filename);
    const { spawn } = require("child_process");

    /**
     * Before recording response
     */
    const { default: Player } = require("@bhznjns/node-mp3-player");
    const imListeningPlayer = new Player({ mode: 'local' });
    imListeningPlayer.src = `./audio/im listening.mp3`;

    /**
     * 
     * Voice Recording
     */
    const micRecord = require('node-mic-record');
    let recording = false;
    let isDone = true;

    // Javascript Sleep
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * API
     */
    const axios = require('axios');

    /**
     * Puppeteer
    */
    const puppeteer = require('puppeteer-extra');

    const StealthPlugin = require('puppeteer-extra-plugin-stealth');

    const { executablePath } = require('puppeteer');

    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: executablePath(),
        userDataDir: './tmp'
    });

    global.g_page = await browser.newPage();

    await g_page.goto('https://beta.elevenlabs.io/speech-synthesis');

    async function setSelectVal(sel, val) {
        g_page.evaluate((data) => {
            const input = document.querySelector(data.sel);
            return input.value = data.val
        }, { sel, val })
    }

    async function startRecording() {

        if (!isDone)
            return;

        await imListeningPlayer.play();

        await sleep(500);

        // Where the recorded voice will be written
        const file = fs.createWriteStream('./WhisperAI/output.wav', { encoding: 'binary' });

        isDone = false;
        recording = true;

        console.log('Recording started...');

        // Record voice from Microphone
        micRecord.start({
            sampleRate: 44100
        })
            .pipe(file);
    }

    async function stopRecording() {

        if (!recording)
            return;

        recording = false;

        console.log('Recording stopped...');

        // Stop the voice recording
        micRecord.stop();

        // Transcribe the recorded voice to LOCAL OpenAI Whisper, output to text
        const outdata = spawn("./WhisperAI/TranscribeCS.exe", [`${appDirectoryPath}/WhisperAI/output.wav`, "--model", `${appDirectoryPath}/WhisperAI/ggml-medium.bin`, "--language", "tl", "--no-timestamps", "--output-txt"]);

        outdata.on('exit', () => {

            console.log('Finished Transcribing');

            // Read the output.txt file
            fs.readFile(`${appDirectoryPath}/WhisperAI/output.txt`, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // Clean the text
                const dataString = data.replace(/(\r\n|\n|\r)/gm, "\n").replace(/\s\s+/g, ' ').trim();

                if (!dataString) {
                    isDone = true;
                    return;
                }

                // Create a prompt for ChatGPT
                const content = dataString + ' and Reply in english and LIMIT your reply in 200 characters maximum. Do not include the character count in reply.';

                // Ask ChatGPT to API
                axios.post('http://localhost:18000/api/ai', {
                    content: content
                }).then(async res => {

                    const answer = res.data.data.answer;

                    // Get elevenlabs textarea
                    const textarea = await g_page.waitForSelector('textarea[name="text"]');

                    // Put the answer in the textarea
                    await setSelectVal('textarea[name="text"]', answer);

                    // This will enable the generate button
                    await textarea.type(' ');

                    // Click the generate button to generate voice
                    const button = await g_page.waitForSelector('textarea[name="text"]~button');
                    await button.click();

                    isDone = true;
                }).catch(() => {
                    isDone = true;
                });
            });

            fs.unlinkSync(`${appDirectoryPath}/WhisperAI/output.txt`);
        });
    }

    app.whenReady().then(() => {
        globalShortcut.register('F5', () => {
            if (!recording) {
                startRecording();
            } else {
                stopRecording();
            }
        });

        console.log('Press F5 to start/stop recording...');
    });

    app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
    });

})();
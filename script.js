document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");
    const fileInfo = document.getElementById("fileInfo");
    const fileNameDisplay = document.getElementById("fileName");
    const removeFile = document.getElementById("removeFile");
    const predictBtn = document.getElementById("predictBtn");
    const progressBar = document.getElementById("progressBar");
    const progressFill = progressBar.querySelector(".progress-fill");
    const result = document.getElementById("result");
    const emotionName = document.getElementById("emotionName");
    const confidenceText = document.getElementById("confidenceText");
    const emotionIcon = document.getElementById("emotionIcon");
    const confidenceFill = document.getElementById("confidenceFill");
    const modelInfo = document.getElementById("modelInfo");
    const recentList = document.getElementById("recentList");
    const loadLogsBtn = document.getElementById("loadLogsBtn");
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const API_URL = "http://127.0.0.1:8000";

    
    uploadArea.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadArea.style.display = "none";
        fileInfo.style.display = "flex";
        fileNameDisplay.textContent = file.name;
        predictBtn.disabled = false;
        console.log("File selected:", file.name);

        displayWaveform(file); 
    }
});

    removeFile.addEventListener("click", () => {
        fileInput.value = "";
        fileInfo.style.display = "none";
        uploadArea.style.display = "block";
        predictBtn.disabled = true;
    });

    predictBtn.disabled = false; 
    predictBtn.addEventListener("click", async () => {
        console.log("Analyze Emotion clicked");
        if (!fileInput.files[0]) {
            alert("No file selected");
            return;
        }

        progressBar.style.display = "block";
        progressFill.style.width = "0%";

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try {
            const response = await fetch(`${API_URL}/predict`, {
                method: "POST",
                body: formData,
            });

            console.log("Response received:", response);

            if (response.ok) {
                const data = await response.json();
                console.log("Response JSON:", data);
                showResult(data);
            } else {
                alert(`Prediction failed: ${response.status}`);
                console.error("Bad response:", await response.text());
            }
        } catch (error) {
            console.error("Prediction error:", error);
            alert("Failed to predict emotion.");
        } finally {
            progressBar.style.display = "none";
        }
    });

function showResult(data) {
    const emotion = data.emotion || "Unknown";
    const confidence = parseFloat(data.confidence) || 0;
    const model = data.model || "custom_rf_model";

    result.style.display = "block";
    emotionName.textContent = emotion;
    confidenceText.textContent = `${(confidence * 100).toFixed(2)}%`;
    modelInfo.textContent = model;

    confidenceFill.style.width = `${(confidence * 100).toFixed(2)}%`;

    console.log("Displayed emotion:", emotion, "Confidence:", confidence, "Model:", model);
}

    loadLogsBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_URL}/logs?limit=5`);
            if (response.ok) {
                const data = await response.json();
                updateRecentList(data.logs);
            } else {
                alert(`Failed to load logs: ${response.status}`);
            }
        } catch (error) {
            console.error("Load logs error:", error);
            alert("Failed to load recent logs.");
        }
    });

    function updateRecentList(logs) {
        recentList.innerHTML = "";
        if (!logs || logs.length === 0) {
            recentList.innerHTML = "<p class='no-data'>No recent analysis</p>";
            return;
        }

        logs.forEach((log) => {
            const listItem = document.createElement("div");
            listItem.classList.add("recent-item");
            listItem.innerHTML = `
                <p>${log.timestamp} - ${log.emotion} (${(log.confidence * 100).toFixed(2)}%)</p>
            `;
            recentList.appendChild(listItem);
        });
    }

    async function checkAPIStatus() {
        try {
            const response = await fetch(`${API_URL}/health`);
            if (response.ok) {
                statusDot.style.backgroundColor = "#4caf50";
                statusText.textContent = "Connected";
            } else {
                statusDot.style.backgroundColor = "#f44336";
                statusText.textContent = "Error";
            }
        } catch (error) {
            statusDot.style.backgroundColor = "#f44336";
            statusText.textContent = "Disconnected";
        }
    }

    checkAPIStatus();
});
function displayWaveform(file) {
    const canvas = document.getElementById("waveformCanvas");
    const ctx = canvas.getContext("2d");
    const placeholder = document.getElementById("waveformPlaceholder");

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = function () {
        const arrayBuffer = reader.result;
        audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
            const rawData = audioBuffer.getChannelData(0); // use first channel
            const samples = 500;
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];

            for (let i = 0; i < samples; i++) {
                let blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum += Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "#4a90e2";
            placeholder.style.display = "none";

            const max = Math.max(...filteredData);
            for (let i = 0; i < samples; i++) {
                const x = (width / samples) * i;
                const normalized = filteredData[i] / max;
                const curved = Math.pow(normalized, 0.6);     
                const y = curved * height * 0.7;              
                ctx.fillRect(x, (height - y) / 2, 1, y);
            }

            console.log("Waveform displayed");
        });
    };

    reader.readAsArrayBuffer(file);
}

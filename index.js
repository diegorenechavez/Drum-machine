const recordButton = document.querySelector(".record");

let recordingStartTime = null;
let currentRecordingSoundNotes = [];
let isPlayingBackRecording = false;
let savedRecordings = [];
let keyboardToSound = {};
let isMuted = false;

function playAndRecordNote(note) {
  const audio = new Audio(`Music_samples/${note}.mp3`);
  if (isRecording()) {
    recordNote(note);
  }
  audio.currentTime = 0;
  audio.play();
}

document.querySelectorAll(".playable").forEach((element) => {
  element.addEventListener("click", () =>
    playAndRecordNote(element.dataset.sound)
  );

  if (element.dataset.key) {
    keyboardToSound[element.dataset.key.toLowerCase()] = element.dataset.sound;
  }
});

document.addEventListener("keydown", (event) => {
  if (!event.repeat) {
    const sound = keyboardToSound[event.key.toLowerCase()];
    const element = document.querySelector(`[data-sound="${sound}"]`);
    if (sound) {
      playAndRecordNote(sound);
      element.classList.add("active");
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (!event.repeat) {
    const sound = keyboardToSound[event.key.toLowerCase()];
    const element = document.querySelector(`[data-sound="${sound}"]`);
    if (sound) {
      element.classList.remove("active");
    }
  }
});

recordButton.addEventListener("click", () => {
  recordButton.classList.toggle("active-record");
  if (isRecording()) {
    startRecording();
  } else {
    stopRecording();
  }
});

document.querySelector(".play").addEventListener("click", (event) => {
  for (const recording of savedRecordings) {
    if (recording.activeTimers) {
      recording.activeTimers.forEach((timer) => clearTimeout(timer));
    }
    playRecording(recording, true);
  }
});

document.querySelector(".stop").addEventListener("click", (event) => {
  for (const recording of savedRecordings) {
    if (recording.activeTimers) {
      recording.activeTimers.forEach((timer) => clearTimeout(timer));
      recording.activeTimers = null;
    }
  }
  document.getElementById("loop").classList.remove("active")
});

function isRecording() {
  return (
    recordButton != null && recordButton.classList.contains("active-record")
  );
}

function startRecording() {
  recordingStartTime = Date.now();
  currentRecordingSoundNotes = [];
}

function stopRecording() {
  const recording = {
    duration: Date.now() - recordingStartTime,
    name: prompt("Name your recording"),
    notes: [...currentRecordingSoundNotes],
  };
  savedRecordings.push(recording);
  let insertedRecordingId = savedRecordings.length - 1;
  let recordingElement = document.createElement("li");
  recordingElement.setAttribute("class", "sounds");
  recordingElement.dataset.recording = insertedRecordingId;
  recordingElement.textContent = recording.name;
  recordingElement.addEventListener("click", (event) => {
    const referencedRecording = savedRecordings[event.target.dataset.recording];
    playRecording(referencedRecording, true);
  });
  document.getElementById("song-recording-list").appendChild(recordingElement);
  document.getElementById("record").classList.remove("active");
}

function playRecording(recording, loop) {
  const { name, notes, duration } = recording;

  if (!notes) return;
  let listOfScheduledTimers = notes.map(({ sound, startTime }) =>
    setTimeout(() => {
      const audio = new Audio(`Music_samples/${sound}.mp3`);
      audio.currentTime = 0;
      audio.play();
    }, startTime)
  );
  if (loop) {
    let loopButton = document.getElementById("loop");
    loopButton.classList.add("active");
    let scheduledLoopTimer = setTimeout(
      () => playRecording(recording, true),
      duration
    );
    listOfScheduledTimers.push(scheduledLoopTimer);
  }
  console.log("Playing recording", name);
  recording.activeTimers = listOfScheduledTimers;
  return listOfScheduledTimers;
}

function recordNote(note) {
  currentRecordingSoundNotes.push({
    sound: note,
    startTime: Date.now() - recordingStartTime,
  });
}

// function muteSound(mute) {
//   // document.getElementsByTagName("audio")
//   if(isMuted)

// }

// function unmute(sound) {

// }

// const muteButton = document.getElementById("mute-button")
// muteButton.addEventListener("click", ()=>muteSound(muteButton))

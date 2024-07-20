import React, { useState, useRef, useEffect } from 'react';

export default function AudioTranscribe() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Function to start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setAudioURL(URL.createObjectURL(e.data));
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);

    // Start recording timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setRecordingTime(0);

    // Clear recording timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Function to save recording
  const saveRecording = () => {
    if (audioURL) {
      setRecordings([...recordings, { url: audioURL, id: Date.now() }]);
      setAudioURL('');
    }
  };

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      setRecording(false);
    } else {
      alert('Please upload a valid audio file.');
    }
  };

  // Function to delete a recording
  const deleteRecording = (id) => {
    setRecordings(recordings.filter(rec => rec.id !== id));
  };

  // Function to handle download of recorded audio
  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recorded_audio.wav'; // Customize the filename if needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-yellow-500 text-blue-500">
      <h2 className="text-4xl text-blue-500 p-4">Get ready</h2>
      <div className="flex flex-col items-center justify-start flex-grow mt-16">
        <h1 className="text-6xl text-blue-500 text-center mb-4">Audio Recording App</h1>
        <h3 className="text-4xl text-blue-500 text-center mb-4">
          Record Audio
          <span className="inline-flex items-center ml-2">
            <svg className="inline-block w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c1.657 0 3-1.343 3-3V7c0-1.657-1.343-3-3-3S9 5.343 9 7v4c0 1.657 1.343 3 3 3zm6 2v2a6 6 0 0 1-12 0v-2m6 2V5"></path>
            </svg>
          </span>
        </h3>
        <div className="relative flex flex-col items-center">
          <input
            type="text"
            placeholder={recording ? `Recording ${Math.floor(recordingTime / 60)}:${recordingTime % 60}` : 'Click to Start Recording'}
            className={`border border-gray-300 p-2 pl-4 pr-12 rounded-md text-left text-xl w-64 cursor-pointer ${recording ? 'bg-red-100' : ''}`}
            readOnly
            onClick={startRecording}
          />
          <button
            onClick={recording ? stopRecording : startRecording}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md"
          >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {audioURL && !recording && (
            <div className="mt-4 flex flex-col items-center">
              <audio src={audioURL} controls className="mb-2" />
              <button
                onClick={() => handleDownload(audioURL)}
                className="py-2 px-4 bg-blue-500 text-white rounded-md mb-2"
              >
                Download Recorded Audio
              </button>
              <button
                onClick={saveRecording}
                className="py-2 px-4 bg-blue-500 text-white rounded-md mb-2"
              >
                Save Recording
              </button>
            </div>
          )}
          <p className="mt-4 text-2xl text-blue-500">Or upload an audio file of any type</p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="mt-2 cursor-pointer bg-white text-blue-500"
          />
          {recordings.length > 0 && (
            <div className="mt-6 w-full flex flex-col items-center">
              <h4 className="text-2xl text-blue-600 mb-2">Saved Recordings</h4>
              <ul className="w-full max-w-md">
                {recordings.map((rec) => (
                  <li key={rec.id} className="flex justify-between items-center mb-2 p-2 border border-gray-300 rounded-md">
                    <audio src={rec.url} controls className="mr-4" />
                    <div className="flex items-center">
                      <button
                        onClick={() => handleDownload(rec.url)}
                        className="py-1 px-3 bg-blue-500 text-white rounded-md mr-2"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteRecording(rec.id)}
                        className="py-1 px-3 bg-red-500 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

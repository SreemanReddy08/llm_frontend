import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useReactToPrint } from "react-to-print";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  // handle file select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return alert("Select a file first");

    setIsLoading(true);
    setProgress(10);
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 50) {
          clearInterval(uploadInterval);
          return 50;
        }
        return prev + 4;
      });
    }, 1000);
    setStatusText("Uploading Video... 🎬");

    try {
      const formData = new FormData();
      formData.append("file", file);

      async () => {
        setInterval(() => {
          for (let i = 11; i < 50; i + 4) {
            setProgress(i);

          }
        }, 1000)
      }

      // Upload phase
      const uploadRes = await fetch("http://13.51.177.137:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const uploadData = await uploadRes.json();
      const uploadedFilename = uploadData.filename;
      setFilename(uploadedFilename);

      setProgress(50);
      setStatusText("Analyzing & Generating Notes...");

      // Process phase
      const processRes = await fetch(
        `http://13.51.177.137:8000/process/?filename=${uploadedFilename}`,
        {
          method: "POST",
        }
      );

      if (!processRes.ok) throw new Error("Processing failed");

      const processData = await processRes.json();

      setProgress(100);
      setStatusText("Done! 🎉");

      setTranscript(processData.transcript);
      setNotes(processData.notes);

      // Short delay before clearing status
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setStatusText("");
      }, 2000);

    } catch (error) {
      console.error(error);
      alert("An error occurred: " + error.message);
      setIsLoading(false);
      setProgress(0);
      setStatusText("");
    }
  };

  const notesRef = useRef();

  const handleDownloadPDF = useReactToPrint({
    contentRef: notesRef, // v3 standard
    content: () => notesRef.current, // Fallback for v2
    documentTitle: filename ? `${filename}-notes` : 'magic-notes',
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Video to Notes AI
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Transform your lectures, meetings, and tutorials into structured, easy-to-read notes in seconds.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-black backdrop-blur-xl border-2 border-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">

          <div className="flex flex-col mb-8 p-10 border-2 border-dashed border-white/50 rounded-2xl hover:border-white hover:bg-white/5 transition-all duration-300 group text-center cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept="video/*,audio/*"
            />
            <div className="text-white mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">
              {file ? file.name : "Drag & Drop or Click to Upload"}
            </h3>
            <p className="text-sm text-gray-300">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Supports MP4"}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={!file || isLoading}
              className="relative inline-flex items-center justify-center px-8 py-4 font-bold text-black transition-all duration-200 bg-white border-2 border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] z-20"
            >
              {isLoading ? "Processing..." : "Generate Magic Notes ✨"}
            </button>
          </div>

          {/* Loading States */}
          {isLoading && (
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-white animate-pulse">{statusText}</span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="w-full bg-black border-2 border-white/30 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Results Area */}
        {(transcript || notes) && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-700">

            {/* Transcript Card */}
            {transcript && (
              <div className="bg-black border-2 border-white rounded-2xl p-6 shadow-xl">
                <h3 className="flex items-center text-xl font-semibold mb-4 text-white border-b-2 border-white pb-3">
                  <svg className="w-5 h-5 mr-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Transcript
                </h3>
                <div className="prose prose-invert max-h-96 overflow-y-auto pr-2">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                </div>
              </div>
            )}

            {/* Notes Card */}
            {notes && (
              <div className="bg-black border-2 border-white rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b-2 border-white pb-3">
                  <h3 className="flex items-center text-xl font-semibold text-white">
                    <svg className="w-5 h-5 mr-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generated Notes
                  </h3>
                  <button
                    onClick={() => handleDownloadPDF()}
                    className="flex items-center px-4 py-2 bg-white text-black border-2 border-white hover:bg-black hover:text-white text-sm font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                </div>
                <div className="w-full max-h-[80vh] overflow-y-auto p-4 md:p-8 bg-black border-t-2 border-white scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent">
                  <div ref={notesRef} className="prose max-w-3xl mx-auto p-8 sm:p-12 md:p-16 bg-white text-black font-serif shadow-[0_0_20px_rgba(255,255,255,0.15)] border-2 border-white print:border-none print:shadow-none print:w-full print:max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline ? (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, "")}
                              style={vscDarkPlus}
                              language={match?.[1] || "text"}
                              PreTag="div"
                            />
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {notes}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
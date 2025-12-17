import React, { useState, useEffect, useRef } from 'react';
import { TerminalButton } from './TerminalComponents';

const VoiceControls = ({ isStreaming, onVoiceToggle }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          // Send the final transcript to the terminal
          handleVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Push-to-talk key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (pushToTalk && e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setCurrentKey('Space');
        startListening();
      }
    };

    const handleKeyUp = (e) => {
      if (pushToTalk && e.code === 'Space') {
        e.preventDefault();
        setCurrentKey(null);
        stopListening();
      }
    };

    if (pushToTalk) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pushToTalk]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceCommand = (transcript) => {
    // Send voice command to terminal
    if (window.terminalInput) {
      window.terminalInput.value = transcript;
      // Trigger enter key to execute
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      window.terminalInput.dispatchEvent(enterEvent);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current || !voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice preferences
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Female') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Susan')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      // Stop any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsSpeaking(false);
    }
  };

  const togglePushToTalk = () => {
    setPushToTalk(!pushToTalk);
    if (isListening) {
      stopListening();
    }
  };

  // Auto-speak when streaming responses finish
  useEffect(() => {
    if (!isStreaming && !voiceEnabled) {
      // Extract the last AI response and speak it
      const lastResponse = document.querySelector(
        '.terminal-output .ai-response:last-child'
      );
      if (lastResponse) {
        speakText(lastResponse.textContent);
      }
    }
  }, [isStreaming, voiceEnabled]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-mermaid-ocean/90 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-3 shadow-glow">
        <div className="flex items-center space-x-2">
          {/* Voice Toggle */}
          <TerminalButton
            variant={voiceEnabled ? 'primary' : 'ghost'}
            size="sm"
            onClick={toggleVoice}
            className="relative"
          >
            {voiceEnabled ? '🎤' : '🚫'}
            {isSpeaking && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            )}
          </TerminalButton>

          {/* Push-to-Talk Toggle */}
          <TerminalButton
            variant={pushToTalk ? 'primary' : 'ghost'}
            size="sm"
            onClick={togglePushToTalk}
            className="relative"
          >
            {pushToTalk ? '🎯' : '💬'}
            {currentKey && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-mermaid-cyan rounded-full animate-pulse" />
            )}
          </TerminalButton>

          {/* Manual Listen Button (when not in push-to-talk mode) */}
          {!pushToTalk && (
            <TerminalButton
              variant={isListening ? 'accent' : 'ghost'}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              disabled={!voiceEnabled}
            >
              {isListening ? '🛑' : '🎧'}
            </TerminalButton>
          )}
        </div>

        {/* Status indicators */}
        <div className="mt-2 text-xs text-mermaid-text/60 text-center">
          {isListening && (
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span>Listening...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-mermaid-cyan rounded-full animate-pulse" />
              <span>Speaking...</span>
            </div>
          )}
          {pushToTalk && !isListening && (
            <div className="text-mermaid-text/40">Hold Space to talk</div>
          )}
          {!voiceEnabled && (
            <div className="text-red-400/60">Voice disabled</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;

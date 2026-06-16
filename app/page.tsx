'use client';

import { useState } from 'react';

interface VoiceOption {
  id: string;
  name: string;
  language?: string;
}

const voiceOptions: VoiceOption[] = [
  { id: 'English_expressive_narrator', name: 'English Expressive Narrator', language: 'English' },
  { id: 'English_radiant_girl', name: 'English Radiant Girl', language: 'English' },
  { id: 'Wise_Woman', name: 'Wise Woman', language: 'English' },
  { id: 'Friendly_Person', name: 'Friendly Person', language: 'English' },
  { id: 'Deep_Voice_Man', name: 'Deep Voice Man', language: 'English' },
  { id: 'Calm_Woman', name: 'Calm Woman', language: 'English' },
  // Add more as needed from Minimax docs
];

const modelOptions = [
  'speech-2.8-hd',
  'speech-2.8-turbo',
  'speech-2.6-hd',
  'speech-2.6-turbo',
  'speech-02-hd',
  'speech-02-turbo',
];

export default function MinimaxTTS() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voiceOptions[0].id);
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }
    setIsLoading(true);
    setError('');
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model: selectedModel,
          voice_id: selectedVoice,
          speed,
          pitch,
          volume,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        setError('No audio received');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">MiniMax TTS</h1>
        <p className="text-zinc-400 mb-8">Text to Speech with voice selection using MiniMax API</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Text Input</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-lg resize-y focus:outline-none focus:border-blue-500"
                placeholder="Enter text to convert to speech..."
              />
              <div className="text-xs text-zinc-500 mt-1">{text.length}/10000 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3"
              >
                {voiceOptions.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.language || 'Multi'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Speed: {speed.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pitch: {pitch}</label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Volume: {volume.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <button
              onClick={generateSpeech}
              disabled={isLoading || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 py-4 rounded-xl font-medium text-lg transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Speech'}
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 flex flex-col">
            <h2 className="text-xl font-semibold mb-6">Generated Audio</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}

            {audioUrl && (
              <div className="space-y-4">
                <audio controls className="w-full" src={audioUrl} />
                <a
                  href={audioUrl}
                  download="speech.mp3"
                  className="block text-center text-blue-400 hover:underline"
                >
                  Download Audio
                </a>
              </div>
            )}

            {!audioUrl && !error && (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-center">
                Your generated speech will appear here
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-zinc-500">
          Set your <code>MINIMAX_API_KEY</code> in Vercel environment variables.<br />
          Get API key from <a href="https://platform.minimax.io" target="_blank" className="text-blue-400 hover:underline">Minimax Platform</a>
        </div>
      </div>
    </div>
  );
}

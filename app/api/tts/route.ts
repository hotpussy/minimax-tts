import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'MINIMAX_API_KEY not set in environment variables' }, { status: 500 });
  }

  try {
    const { text, model, voice_id, speed, pitch, volume } = await request.json();

    const payload = {
      model: model || 'speech-2.8-hd',
      text,
      stream: false,
      voice_setting: {
        voice_id: voice_id || 'English_expressive_narrator',
        speed: speed || 1,
        vol: volume || 1,
        pitch: pitch || 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1,
      },
      output_format: 'url',
    };

    const response = await fetch('https://api.minimax.io/v1/t2a_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.base_resp?.status_code !== 0) {
      return NextResponse.json({ 
        error: data.base_resp?.status_msg || 'API request failed',
        details: data 
      }, { status: 400 });
    }

    const audioUrl = data.data?.audio;

    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL received' }, { status: 500 });
    }

    return NextResponse.json({ audioUrl });

  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

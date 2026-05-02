import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { generateSpeech, PRESET_VOICES, checkApiKey } from '../providers/mimo.js';

interface GenerateBody {
  text: string;
  model?: string;
  voice?: string;
  format?: 'wav' | 'mp3';
  style_prompt?: string;
  voice_description?: string;
  reference_audio_data?: string;
}

export async function ttsRoutes(app: FastifyInstance) {
  /**
   * POST /api/tts/generate
   * Generate TTS audio from text.
   */
  app.post('/api/tts/generate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as GenerateBody;

    if (!body.text || typeof body.text !== 'string') {
      return reply.status(400).send({ error: 'Missing required field: text' });
    }

    if (body.text.length > 5000) {
      return reply.status(400).send({ error: 'Text too long (max 5000 characters)' });
    }

    try {
      request.log.info(
        { textLen: body.text.length, model: body.model, voice: body.voice },
        'Generating TTS audio'
      );

      const result = await generateSpeech({
        text: body.text,
        model: body.model,
        voice: body.voice,
        format: body.format || 'wav',
        style_prompt: body.style_prompt,
        voice_description: body.voice_description,
        reference_audio_data: body.reference_audio_data,
      });

      request.log.info({ audioSize: result.audioData.length }, 'TTS generation complete');

      reply.header(
        'Content-Type',
        result.format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
      );
      reply.header(
        'Content-Disposition',
        `attachment; filename="tts-output.${result.format}"`
      );
      return reply.send(result.audioData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      request.log.error({ err: error, message, stack }, 'TTS generation failed');
      return reply.status(500).send({ error: message });
    }
  });

  /**
   * GET /api/voices
   * List available preset voices.
   */
  app.get('/api/voices', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      voices: PRESET_VOICES,
      models: [
        {
          id: 'mimo-v2.5-tts',
          name: 'Preset Voices',
          description: 'Use built-in preset voices',
        },
        {
          id: 'mimo-v2.5-tts-voicedesign',
          name: 'Voice Design',
          description: 'Create new voices via description',
        },
        {
          id: 'mimo-v2.5-tts-voiceclone',
          name: 'Voice Clone',
          description: 'Clone voices from reference audio',
        },
      ],
    });
  });

  /**
   * GET /api/health
   * Health check with API key status.
   */
  app.get('/api/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    const hasKey = checkApiKey();
    return reply.send({
      status: 'ok',
      apiKeyConfigured: hasKey,
      timestamp: new Date().toISOString(),
    });
  });
}

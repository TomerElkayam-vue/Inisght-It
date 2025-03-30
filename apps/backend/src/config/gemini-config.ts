import { ConfigType, registerAs } from '@nestjs/config';

export const geminiConfig = registerAs('gemini', () => ({
  geminiKey: process.env.GEMINI_KEY,
}));

export type GeminiConfigType = ConfigType<typeof geminiConfig>;

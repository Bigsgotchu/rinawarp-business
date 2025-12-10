/**
 * ============================================================
 * 🧠 RinaWarp OpenAI Stub
 * ------------------------------------------------------------
 * This safely replaces the OpenAI SDK when running in
 * the renderer (Vite/Electron frontend). It prevents build
 * errors and lets your app start even without the SDK.
 * ============================================================
 */

export const OpenAI = function () {
  console.warn('[RinaWarp] OpenAI SDK not loaded in renderer context.');
  return {
    chat: {
      completions: {
        create: async () => ({
          choices: [
            {
              message: {
                content:
                  '[Stubbed AI Response] The OpenAI SDK is only available in backend or Electron main process.',
              },
            },
          ],
        }),
      },
    },
  };
};

export default { OpenAI };

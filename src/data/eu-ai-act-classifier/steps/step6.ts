// Step 6 — Article 50 transparency obligations
// ALWAYS runs in parallel, regardless of prior classification (v1.1 correction).
// Populates article_50_transparency_triggers[] even for high-risk systems.

import type { StepDef } from "../types";

export const STEP_6: StepDef = {
  id: "step6",
  title: "Does your system need to tell people it's AI?",
  shortLabel: "Transparency",
  intro:
    "Article 50 imposes transparency obligations that apply regardless of risk classification. Even high-risk systems have Art. 50 duties on top of their Chapter III obligations.",
  questions: [
    {
      id: "interacts_directly_with_people",
      step: "step6",
      order: 0,
      type: "yes_no",
      prompt:
        "Does the system interact directly with people (e.g., a chatbot, voice assistant, or avatar) where it may not be obvious they are talking to AI?",
      why:
        "People have a right to know when they're interacting with AI. If it's obvious — for example, a clearly labelled 'AI assistant' button — this may not apply.",
      legal: { article: "Art. 50(1)" },
    },
    {
      id: "generates_synthetic_content",
      step: "step6",
      order: 1,
      type: "yes_no",
      prompt:
        "Does the system generate or manipulate synthetic audio, image, video, or text content?",
      why:
        "Providers must ensure AI-generated content is marked in a machine-readable format and detectable as artificial.",
      legal: { article: "Art. 50(2)" },
    },
    {
      id: "standard_editing_exception",
      step: "step6",
      order: 2,
      type: "yes_no",
      prompt:
        "Is the system's content manipulation limited to standard editing (e.g., brightness, contrast, cropping) that does not substantially alter the content?",
      why:
        "Standard editing that does not change meaning or appearance in a misleading way is excluded from the transparency requirement.",
      legal: { article: "Art. 50(2)" },
      showIf: (a) => a.generates_synthetic_content === "yes",
      isExceptionChild: "generates_synthetic_content",
    },
    {
      id: "emotion_recognition_or_biometric_cat",
      step: "step6",
      order: 3,
      type: "yes_no",
      prompt:
        "Does the system perform emotion recognition or biometric categorisation on people?",
      why:
        "Deployers must inform people when emotion recognition or biometric categorisation is being applied to them, even outside high-risk contexts.",
      legal: { article: "Art. 50(3)" },
    },
    {
      id: "generates_deepfakes",
      step: "step6",
      order: 4,
      type: "yes_no",
      prompt:
        "Does the system generate or manipulate content that constitutes a 'deep fake' — content resembling real persons, objects, places, or events that would falsely appear authentic?",
      why:
        "Deployers must disclose that deep fake content has been artificially generated or manipulated.",
      legal: { article: "Art. 50(4)" },
    },
    {
      id: "ai_generated_public_interest_text",
      step: "step6",
      order: 5,
      type: "yes_no",
      prompt:
        "Does the system generate text that is published for the purpose of informing the public on matters of public interest?",
      why:
        "AI-generated public-interest text must be labelled as artificially generated, unless it has undergone human editorial review and a natural or legal person holds editorial responsibility.",
      legal: { article: "Art. 50(4)" },
    },
    {
      id: "public_interest_text_human_review_exception",
      step: "step6",
      order: 6,
      type: "yes_no",
      prompt:
        "Has the AI-generated text undergone human editorial review, and does a natural or legal person hold editorial responsibility for the publication?",
      why:
        "If an editor (individual or organisation) reviews the text and takes editorial responsibility, the labelling requirement does not apply.",
      legal: { article: "Art. 50(4)" },
      showIf: (a) => a.ai_generated_public_interest_text === "yes",
      isExceptionChild: "ai_generated_public_interest_text",
    },
  ],
};

// Step 6 — Article 50 transparency obligations
// Beginner-facing copy: "TRANSPARENCY" — 5 main cards plus 2 conditional
// sub-questions. Always runs in parallel to the rest of the flow (v1.1
// correction) so that even high-risk systems capture their Art. 50 triggers.

import type { StepDef } from "../types";

export const STEP_6: StepDef = {
  id: "step6",
  title: "Does this system trigger transparency duties?",
  shortLabel: "Transparency",
  intro:
    "Some transparency obligations apply regardless of risk classification. We'll check those now.",
  questions: [
    {
      id: "interacts_directly_with_people",
      step: "step6",
      order: 0,
      type: "yes_no",
      prompt:
        "Do people interact with this system without it being obvious that it is AI?",
      helper:
        "This includes chatbots, voice assistants, avatars, or similar interfaces where users may think they are interacting with a human.",
      why: "If yes, users must be informed they are interacting with AI.",
      legal: { article: "Art. 50(1)" },
    },
    {
      id: "generates_synthetic_content",
      step: "step6",
      order: 1,
      type: "yes_no",
      prompt:
        "Does the system generate or alter synthetic text, images, audio, or video?",
      helper:
        "This checks whether disclosure or machine-readable marking duties may apply.",
      why:
        "If yes, AI-generated content must be marked as artificial in a machine-readable format.",
      legal: { article: "Art. 50(2)" },
    },
    {
      id: "standard_editing_exception",
      step: "step6",
      order: 2,
      type: "yes_no",
      prompt:
        "Is the system limited to standard editing that does not substantially alter the content?",
      helper:
        "Standard editing includes adjustments like brightness, contrast, or cropping that do not change the meaning of the content.",
      why: "If yes, the synthetic content disclosure requirement does not apply.",
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
      helper:
        "If yes, people generally need to be informed that this is happening.",
      why:
        "Deployers must inform people when emotion recognition or biometric categorisation is applied to them, even outside high-risk contexts.",
      legal: { article: "Art. 50(3)" },
    },
    {
      id: "generates_deepfakes",
      step: "step6",
      order: 4,
      type: "yes_no",
      prompt:
        "Does the system generate or alter content that could be mistaken for real or authentic content?",
      helper:
        "This includes deepfakes or similar synthetic media that resembles real people, objects, places, or events.",
      why:
        "If yes, deployers must disclose that the content has been artificially generated or manipulated.",
      legal: { article: "Art. 50(4)" },
    },
    {
      id: "ai_generated_public_interest_text",
      step: "step6",
      order: 5,
      type: "yes_no",
      prompt:
        "Does the system generate text for publication on matters of public interest?",
      helper:
        "This may trigger disclosure duties, unless a human editor reviews the content and takes responsibility for it.",
      why:
        "AI-generated public-interest text must be labelled as artificially generated, unless a human editor holds editorial responsibility.",
      legal: { article: "Art. 50(4)" },
    },
    {
      id: "public_interest_text_human_review_exception",
      step: "step6",
      order: 6,
      type: "yes_no",
      prompt:
        "Has a human editor reviewed this text and taken editorial responsibility for it?",
      helper:
        "A natural or legal person must take editorial responsibility for the publication.",
      why: "If yes, the labelling requirement does not apply.",
      legal: { article: "Art. 50(4)" },
      showIf: (a) => a.ai_generated_public_interest_text === "yes",
      isExceptionChild: "ai_generated_public_interest_text",
    },
  ],
};

// Step 2 — Prohibited practices (Art. 5)
// Beginner-facing copy: "PROHIBITED PRACTICES" — 8 cards with a short label,
// a plain-language description, and a consistent "Does this apply to your
// system?" question. Field ids and legal references are unchanged. Nested
// exceptions are kept and rewritten in the same concise voice.

import type { StepDef } from "../types";

export const STEP_2: StepDef = {
  id: "step2",
  title: "Could this system involve a prohibited AI practice?",
  shortLabel: "Prohibited",
  intro:
    "Some AI practices are prohibited under Article 5. If your system falls into one of them, it cannot be placed on the EU market or used in the EU.",
  questions: [],
  prohibitedPractices: [
    {
      id: "prohibited_manipulation",
      name: "Manipulative or deceptive AI",
      summary:
        "AI that uses subliminal, manipulative, or deceptive techniques to distort behaviour in a way that causes or is likely to cause significant harm.",
      exampleYes:
        "A shopping app that uses subliminal visual cues to push compulsive purchases that harm users financially.",
      exampleNo:
        "A recommendation engine that suggests products based on browsing history.",
      exceptions: [],
      legal: { article: "Art. 5(1)(a)" },
    },
    {
      id: "prohibited_vulnerability_exploitation",
      name: "Exploiting vulnerabilities",
      summary:
        "AI that exploits a person's age, disability, or social or economic situation in a way that distorts behaviour and causes or is likely to cause significant harm.",
      exampleYes:
        "An AI toy that encourages dangerous behaviour in children.",
      exampleNo:
        "An accessibility tool that adapts interfaces for users with disabilities.",
      exceptions: [],
      legal: { article: "Art. 5(1)(b)" },
    },
    {
      id: "prohibited_social_scoring",
      name: "Social scoring",
      summary:
        "AI that evaluates or classifies people over time based on social behaviour or personal traits, leading to unjustified or disproportionate detrimental treatment.",
      exampleYes:
        "A system that denies housing based on social media activity.",
      exampleNo:
        "A credit scoring system based on financial data (this may be high-risk, but not prohibited).",
      exceptions: [],
      legal: { article: "Art. 5(1)(c)" },
    },
    {
      id: "prohibited_criminal_prediction",
      name: "Criminal risk prediction based only on profiling",
      summary:
        "AI that predicts a person's risk of committing a crime based only on profiling or personal traits, without objective and verifiable facts directly linked to criminal activity.",
      exampleYes:
        "A system that scores individuals for likelihood of criminality from demographic profiling.",
      exampleNo:
        "A risk model that uses objective, verifiable facts about prior criminal activity.",
      exceptions: [
        {
          id: "prohibited_criminal_prediction_exception",
          question:
            "Is the risk assessment based on objective and verifiable facts directly linked to criminal activity?",
          helper:
            "If the assessment rests on concrete facts about what a person has actually done, rather than on profiling or personal traits, the prohibition may not apply.",
          legal: { article: "Art. 5(1)(d)" },
        },
      ],
      legal: { article: "Art. 5(1)(d)" },
    },
    {
      id: "prohibited_facial_scraping",
      name: "Untargeted facial image scraping",
      summary:
        "AI that creates or expands facial recognition databases by scraping facial images from the internet or CCTV footage without targeting specific individuals.",
      exampleYes:
        "A face database assembled by crawling social media images at scale.",
      exampleNo:
        "A face recognition model trained on a lawfully licensed, consented dataset.",
      exceptions: [],
      legal: { article: "Art. 5(1)(e)" },
    },
    {
      id: "prohibited_emotion_workplace_education",
      name: "Emotion recognition in work or education",
      summary:
        "AI that infers emotions in workplaces or educational settings, except in limited medical or safety cases.",
      exampleYes:
        "A classroom camera system that flags students as 'disengaged' based on facial expressions.",
      exampleNo:
        "An opt-in wellness tool used outside of employment or education.",
      exceptions: [
        {
          id: "prohibited_emotion_medical_safety_exception",
          question:
            "Is the emotion inference used solely for medical or safety reasons?",
          helper:
            "Narrow medical or safety uses (for example, detecting a driver falling asleep or monitoring patient distress in clinical care) are permitted.",
          legal: { article: "Art. 5(1)(f)" },
        },
      ],
      legal: { article: "Art. 5(1)(f)" },
    },
    {
      id: "prohibited_biometric_categorisation",
      name: "Biometric categorisation of protected traits",
      summary:
        "AI that categorises people using biometric data to infer sensitive traits such as race, political views, religion, sexual orientation, or similar protected characteristics.",
      exampleYes:
        "A system that infers political views from photographs of attendees at public events.",
      exampleNo:
        "A biometric verification system that checks a face against a stored template for access control.",
      exceptions: [
        {
          id: "prohibited_biometric_exception",
          question:
            "Is the categorisation limited to labelling or filtering lawfully acquired biometric datasets, or to specific law enforcement uses under legal safeguards?",
          helper:
            "These narrow exceptions cover dataset curation and defined law enforcement uses, not commercial profiling.",
          legal: { article: "Art. 5(1)(g)" },
        },
      ],
      legal: { article: "Art. 5(1)(g)" },
    },
    {
      id: "prohibited_rbi_law_enforcement",
      name: "Real-time remote biometric identification by police in public spaces",
      summary:
        "Use of real-time remote biometric identification in publicly accessible spaces for law enforcement, except in narrow statutory exceptions.",
      exampleYes:
        "A police deployment of real-time face recognition in a public square.",
      exampleNo:
        "Post-event forensic identification from CCTV footage after a specific crime.",
      exceptions: [
        {
          id: "rbi_exception_victim_search",
          question:
            "Is it used solely for the targeted search for specific victims of abduction, trafficking, or sexual exploitation?",
          legal: { article: "Art. 5(2)" },
        },
        {
          id: "rbi_exception_imminent_threat",
          question:
            "Is it used to prevent a specific, substantial, and imminent threat to life, or a genuine and foreseeable terrorist attack?",
          legal: { article: "Art. 5(2)" },
        },
        {
          id: "rbi_exception_serious_crime",
          question:
            "Is it used to locate or identify a suspect of a specific serious criminal offence, with prior judicial or independent administrative authorisation?",
          legal: { article: "Art. 5(2)" },
        },
      ],
      legal: { article: "Art. 5(1)(h)" },
    },
  ],
};

// Step 2 — Prohibited practices (Art. 5)
// Eight practices, some with nested exception sub-questions.
// Exceptions are represented as ProhibitedExceptionDef arrays, aggregated by the engine.

import type { StepDef } from "../types";

export const STEP_2: StepDef = {
  id: "step2",
  title: "Could this system involve a banned AI practice?",
  shortLabel: "Prohibited",
  intro:
    "Eight practices are outright prohibited under Article 5. Some have narrow exceptions. These prohibitions have been enforceable since 2 February 2025.",
  questions: [], // all driven via prohibitedPractices below
  prohibitedPractices: [
    {
      id: "prohibited_manipulation",
      name: "Manipulative or deceptive AI",
      summary:
        "AI that uses subliminal or deceptive techniques to distort someone's behaviour and cause harm.",
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
        "AI that targets someone's age, disability, or economic hardship to manipulate their behaviour.",
      exampleYes: "An AI toy that encourages dangerous behaviour in children.",
      exampleNo:
        "An accessibility tool that adapts interfaces for users with disabilities.",
      exceptions: [],
      legal: { article: "Art. 5(1)(b)" },
    },
    {
      id: "prohibited_social_scoring",
      name: "Social scoring",
      summary:
        "AI that rates people based on their social behaviour and penalises them in unrelated areas of life.",
      exampleYes: "A system that denies housing based on social media activity.",
      exampleNo:
        "A credit scoring system based on financial data (this may be high-risk, but not prohibited).",
      exceptions: [],
      legal: { article: "Art. 5(1)(c)" },
    },
    {
      id: "prohibited_criminal_prediction",
      name: "Criminal prediction from profiling",
      summary:
        "AI that predicts someone will commit a crime based only on who they are, not what they've done.",
      exampleYes:
        "A system that scores individuals for likelihood of criminality from demographic profiling.",
      exampleNo:
        "A risk model that uses objective, verifiable facts about prior criminal activity.",
      exceptions: [
        {
          id: "prohibited_criminal_prediction_exception",
          question:
            "Is the risk assessment based on objective, verifiable facts directly linked to criminal activity?",
          helper:
            "This is the only carve-out for criminal risk prediction. If the assessment rests on concrete facts about what the person has actually done — not on profiling or personality traits — the prohibition may not apply.",
          legal: { article: "Art. 5(1)(d)" },
        },
      ],
      legal: { article: "Art. 5(1)(d)" },
    },
    {
      id: "prohibited_facial_scraping",
      name: "Untargeted facial scraping",
      summary:
        "AI that builds facial recognition databases by mass-scraping photos from the internet or CCTV.",
      exampleYes:
        "A face database assembled by crawling social media images at scale.",
      exampleNo:
        "A face recognition model trained on a lawfully licensed, consented dataset.",
      exceptions: [],
      legal: { article: "Art. 5(1)(e)" },
    },
    {
      id: "prohibited_emotion_workplace_education",
      name: "Emotion recognition at work or school",
      summary: "AI that reads people's emotions in workplaces or educational settings.",
      exampleYes:
        "A classroom camera system that flags students as 'disengaged' based on facial expressions.",
      exampleNo:
        "An opt-in wellness tool used outside of employment or educational settings.",
      exceptions: [
        {
          id: "prohibited_emotion_medical_safety_exception",
          question: "Is the emotion inference performed solely for medical or safety reasons?",
          helper:
            "The carve-out covers detecting a driver falling asleep, monitoring patient distress in clinical care, and similar medical or safety contexts.",
          legal: { article: "Art. 5(1)(f)" },
        },
      ],
      legal: { article: "Art. 5(1)(f)" },
    },
    {
      id: "prohibited_biometric_categorisation",
      name: "Biometric categorisation of protected traits",
      summary:
        "AI that categorises people individually based on their biometric data to infer sensitive attributes: race, political opinions, trade union membership, religious beliefs, sex life, or sexual orientation.",
      exampleYes:
        "A system that infers political views from photographs of attendees at public events.",
      exampleNo:
        "A biometric verification system that checks a face against a stored template for access control.",
      exceptions: [
        {
          id: "prohibited_biometric_exception",
          question:
            "Is the categorisation limited to labelling or filtering lawfully acquired biometric datasets, or to law enforcement categorisation under legal safeguards?",
          helper:
            "These narrow exceptions cover dataset curation and specific law enforcement uses, not commercial profiling.",
          legal: { article: "Art. 5(1)(g)" },
        },
      ],
      legal: { article: "Art. 5(1)(g)" },
    },
    {
      id: "prohibited_rbi_law_enforcement",
      name: "Real-time biometric identification by police in public spaces",
      summary:
        "Live facial recognition in publicly accessible spaces for law enforcement purposes.",
      exampleYes: "A police deployment of real-time face recognition in a public square.",
      exampleNo:
        "Post-event forensic identification from CCTV footage after a specific crime (this may be high-risk, but not prohibited under this article).",
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

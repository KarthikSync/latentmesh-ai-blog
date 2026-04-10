// Step 4 — Annex III use-case domains (Art. 6(2))
// Eight domains (Tier 1) with sub-use-cases (Tier 2). Sub-use-cases carry
// optional exclusion gates (bio_verification_only, svc_financial_fraud_only,
// mig_travel_doc_only, justice_campaign_admin_only) and cross-references
// to Art. 5 prohibitions where applicable.

import type { StepDef } from "../types";

export const STEP_4: StepDef = {
  id: "step4_tier1",
  title: "What is your AI system intended to do?",
  shortLabel: "Use case",
  intro:
    "The Act lists eight domains of use. If your system's intended purpose falls into any of them, it is presumed high-risk (subject to the exception test in the next step). Select all that apply.",
  questions: [],
  domains: [
    {
      id: "biometrics",
      annexPoint: "Point 1",
      title: "Biometric identification and categorisation",
      description:
        "Your system identifies, categorises, or reads the emotions of people using their physical features (face, voice, fingerprints, gait).",
      triggers: [
        "Remote biometric identification of people in public or at a distance",
        "Inferring traits (age, gender, emotion) from biometric signals",
        "Emotion recognition from voice or facial expressions",
      ],
      subUseCases: [
        {
          id: "bio_remote_identification",
          label: "Remote biometric identification",
          helper:
            "Identifying people at a distance using face, voice, gait. Includes post-identification after the fact. Note: real-time biometric identification by law enforcement is covered under Article 5, not here.",
          annexRef: "III-1(a)",
        },
        {
          id: "bio_verification_only",
          label: "One-to-one biometric verification only",
          helper:
            "Confirming 'are you who you claim to be?' (e.g., unlocking a phone with your face). This is explicitly excluded from Annex III.",
          annexRef: "III-1(a) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
        {
          id: "bio_categorisation",
          label: "Biometric categorisation by sensitive attributes",
          helper:
            "Inferring age, ethnicity, or other characteristics from biometric data.",
          annexRef: "III-1(b)",
          crossRef: {
            article: "Art. 5(1)(g)",
            note:
              "If your system infers race, political opinions, religion, sex life, or sexual orientation from biometric data, it may be prohibited under Article 5(1)(g), not just high-risk. Review your Step 2 answers.",
          },
        },
        {
          id: "bio_emotion_recognition",
          label: "Emotion recognition",
          helper:
            "Inferring emotional states from biometric signals (facial expressions, voice tone, body language).",
          annexRef: "III-1(c)",
          crossRef: {
            article: "Art. 5(1)(f)",
            note:
              "Emotion recognition in workplaces or educational institutions may be prohibited under Article 5(1)(f), not just high-risk. Review your Step 2 answers.",
          },
        },
      ],
    },
    {
      id: "critical_infrastructure",
      annexPoint: "Point 2",
      title: "Critical infrastructure",
      description:
        "Your system manages or is a safety component in essential services like electricity, water, gas, heating, road traffic, or digital infrastructure.",
      triggers: [
        "Safety component in a utility or traffic system",
        "Operating critical digital infrastructure",
      ],
      subUseCases: [
        {
          id: "infra_safety_component",
          label: "Safety component for utilities or road traffic",
          helper:
            "AI that is a safety component in the management and operation of road traffic, or in the supply of water, gas, heating, or electricity.",
          annexRef: "III-2(a)",
        },
        {
          id: "infra_digital",
          label: "Safety component for critical digital infrastructure",
          helper:
            "AI that is a safety component in the management and operation of critical digital infrastructure.",
          annexRef: "III-2(b)",
        },
      ],
    },
    {
      id: "education",
      annexPoint: "Point 3",
      title: "Education and vocational training",
      description:
        "Your system makes decisions about students: admissions, grading, exam monitoring, or determining what level of education someone should receive.",
      triggers: [
        "Admissions or placement decisions",
        "Grading or evaluating learning outcomes",
        "Proctoring exams",
      ],
      subUseCases: [
        {
          id: "edu_admission",
          label: "Admissions and placement",
          helper:
            "Determining access to or admission into educational or vocational training institutions.",
          annexRef: "III-3(a)",
        },
        {
          id: "edu_learning_outcomes",
          label: "Evaluating learning outcomes",
          helper:
            "Evaluating learning outcomes, including when those outcomes are used to steer the learning process.",
          annexRef: "III-3(b)",
        },
        {
          id: "edu_level_assessment",
          label: "Assessing appropriate level of education",
          helper:
            "Assessing the appropriate level of education an individual will receive or be able to access.",
          annexRef: "III-3(c)",
        },
        {
          id: "edu_proctoring",
          label: "Exam proctoring",
          helper:
            "Monitoring and detecting prohibited behaviour of students during tests.",
          annexRef: "III-3(d)",
        },
      ],
    },
    {
      id: "employment",
      annexPoint: "Point 4",
      title: "Employment and worker management",
      description:
        "Your system is involved in hiring, evaluating, promoting, terminating, or monitoring workers.",
      triggers: [
        "Candidate screening, filtering, or scoring",
        "Performance evaluation or promotion decisions",
        "Task allocation based on personal traits",
      ],
      subUseCases: [
        {
          id: "emp_recruitment",
          label: "Recruitment and candidate evaluation",
          helper:
            "Placing targeted job advertisements, screening or filtering applications, or evaluating candidates.",
          annexRef: "III-4(a)",
        },
        {
          id: "emp_work_decisions",
          label: "Work decisions and performance monitoring",
          helper:
            "Making decisions affecting terms of work, promotion, termination, task allocation based on behaviour or personal traits, or monitoring and evaluating performance and behaviour.",
          annexRef: "III-4(b)",
        },
      ],
    },
    {
      id: "essential_services",
      annexPoint: "Point 5",
      title: "Access to essential services and benefits",
      description:
        "Your system evaluates people's eligibility for public benefits, credit, insurance, or emergency services.",
      triggers: [
        "Scoring benefit eligibility",
        "Credit scoring",
        "Insurance risk assessment and pricing",
        "Emergency call triage",
      ],
      subUseCases: [
        {
          id: "svc_public_benefits",
          label: "Public benefits eligibility",
          helper:
            "Evaluating eligibility for public assistance benefits and services, or granting, reducing, revoking, or reclaiming such benefits.",
          annexRef: "III-5(a)",
        },
        {
          id: "svc_creditworthiness",
          label: "Creditworthiness and credit scoring",
          helper:
            "Evaluating creditworthiness or establishing credit scores.",
          annexRef: "III-5(b)",
        },
        {
          id: "svc_financial_fraud_only",
          label: "Financial fraud detection only",
          helper:
            "AI used solely for detecting financial fraud — NOT credit scoring — is explicitly excluded from high-risk.",
          annexRef: "III-5(b) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
        {
          id: "svc_insurance",
          label: "Life and health insurance risk / pricing",
          helper:
            "Risk assessment and pricing for natural persons in life and health insurance.",
          annexRef: "III-5(c)",
        },
        {
          id: "svc_emergency",
          label: "Emergency response triage",
          helper:
            "Evaluating and classifying emergency calls, or dispatching/prioritising emergency first response services, including emergency healthcare triage.",
          annexRef: "III-5(d)",
        },
      ],
    },
    {
      id: "law_enforcement",
      annexPoint: "Point 6",
      title: "Law enforcement",
      description:
        "Your system helps police or justice authorities assess risk, evaluate evidence, detect crime, or investigate individuals.",
      triggers: [
        "Victim risk assessment",
        "Evaluating reliability of evidence",
        "Profiling during investigations",
      ],
      subUseCases: [
        {
          id: "le_victim_risk",
          label: "Victim risk assessment",
          helper:
            "Assessing the risk of a natural person becoming a victim of criminal offences.",
          annexRef: "III-6(a)",
        },
        {
          id: "le_polygraph",
          label: "Polygraphs in investigations",
          helper:
            "Polygraphs and similar tools used during criminal investigations or proceedings.",
          annexRef: "III-6(b)",
        },
        {
          id: "le_evidence",
          label: "Evidence reliability evaluation",
          helper:
            "Evaluating the reliability of evidence during criminal investigations or proceedings.",
          annexRef: "III-6(c)",
        },
        {
          id: "le_reoffending",
          label: "Reoffending risk assessment",
          helper:
            "Assessing the risk of a natural person offending or reoffending, not solely based on profiling.",
          annexRef: "III-6(d)",
          crossRef: {
            article: "Art. 5(1)(d)",
            note:
              "If risk assessment is based solely on profiling without objective, verifiable facts, it may be prohibited under Article 5(1)(d), not just high-risk. Review your Step 2 answers.",
          },
        },
        {
          id: "le_profiling",
          label: "Profiling in investigations",
          helper:
            "Profiling of natural persons during detection, investigation, or prosecution of criminal offences.",
          annexRef: "III-6(e)",
        },
      ],
    },
    {
      id: "migration",
      annexPoint: "Point 7",
      title: "Migration, asylum, and border control",
      description:
        "Your system is used for visa/asylum processing, border identification, or assessing migration-related risks.",
      triggers: [
        "Migration risk assessment",
        "Asylum or visa application processing",
        "Border identification beyond document verification",
      ],
      subUseCases: [
        {
          id: "mig_polygraph",
          label: "Polygraphs in migration interviews",
          helper: "Polygraphs and similar tools during migration interviews.",
          annexRef: "III-7(a)",
        },
        {
          id: "mig_risk_assessment",
          label: "Migration risk assessment",
          helper:
            "Assessing security, irregular migration, or health risks posed by a person intending to enter or having entered the EU.",
          annexRef: "III-7(b)",
        },
        {
          id: "mig_application",
          label: "Asylum, visa, and residence permit processing",
          helper:
            "Examining or assisting with applications for asylum, visa, and residence permits, and associated complaints.",
          annexRef: "III-7(c)",
        },
        {
          id: "mig_identification",
          label: "Border identification of persons",
          helper:
            "Detecting, recognising, or identifying natural persons in the context of border management (excluding travel document verification).",
          annexRef: "III-7(d)",
        },
        {
          id: "mig_travel_doc_only",
          label: "Travel document verification only",
          helper:
            "AI used solely for verifying travel documents is explicitly excluded from high-risk.",
          annexRef: "III-7(d) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
      ],
    },
    {
      id: "justice_democracy",
      annexPoint: "Point 8",
      title: "Justice and democratic processes",
      description:
        "Your system assists courts with legal research or interpretation, or influences elections and referenda.",
      triggers: [
        "Assisting judicial research or interpretation",
        "Influencing elections or voter behaviour",
      ],
      subUseCases: [
        {
          id: "justice_legal_research",
          label: "Judicial research and interpretation",
          helper:
            "Assisting a judicial authority in researching and interpreting facts and the law, applying the law to a concrete set of facts, or alternative dispute resolution.",
          annexRef: "III-8(a)",
        },
        {
          id: "justice_elections",
          label: "Influencing elections or voter behaviour",
          helper:
            "Influencing the outcome of an election or referendum, or the voting behaviour of persons exercising their vote.",
          annexRef: "III-8(b)",
        },
        {
          id: "justice_campaign_admin_only",
          label: "Campaign logistics only",
          helper:
            "AI used solely for organising, optimising, or structuring political campaigns (logistics/admin) with no direct voter exposure is explicitly excluded from high-risk.",
          annexRef: "III-8(b) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
      ],
    },
  ],
};

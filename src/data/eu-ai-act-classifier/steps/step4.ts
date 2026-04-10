// Step 4 — Annex III use-case domains (Art. 6(2))
// Beginner-facing copy: "USE CASE" — Tier 1 is 8 domain cards with a plain
// description and an "Examples" list. Tier 2 sub-use-cases use a consistent
// "short label + 'Used to...' descriptive sentence" pattern. Field ids,
// exclusion gates, and cross-references are unchanged.

import type { StepDef } from "../types";

export const STEP_4: StepDef = {
  id: "step4_tier1",
  title: "Which use cases apply to this system?",
  shortLabel: "Use case",
  intro:
    "The Act lists specific high-risk use cases. Select every domain that directly applies.",
  questions: [],
  domains: [
    {
      id: "biometrics",
      annexPoint: "Point 1",
      title: "Biometric identification and categorisation",
      description:
        "The system identifies people, verifies identity, categorises people using biometric data, or infers emotions from physical features.",
      triggers: [
        "Remote biometric identification",
        "Inferring traits from facial or voice signals",
        "Emotion recognition from images, video, or audio",
      ],
      subUseCases: [
        {
          id: "bio_remote_identification",
          label: "Remote biometric identification",
          helper:
            "Used to identify people at a distance using physical features such as face, voice, or gait, including after-the-fact identification from recordings.",
          annexRef: "III-1(a)",
        },
        {
          id: "bio_verification_only",
          label: "One-to-one biometric verification only",
          helper:
            "Used only to confirm whether a person is who they claim to be, such as unlocking a device or logging into an account. This is explicitly excluded from Annex III.",
          annexRef: "III-1(a) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
        {
          id: "bio_categorisation",
          label: "Biometric categorisation by sensitive attributes",
          helper:
            "Used to infer age, ethnicity, or other characteristics from biometric data.",
          annexRef: "III-1(b)",
          crossRef: {
            article: "Art. 5(1)(g)",
            note:
              "If your system infers race, political views, religion, sex life, or sexual orientation from biometric data, it may be prohibited under Article 5(1)(g), not just high-risk. Review your Step 2 answers.",
          },
        },
        {
          id: "bio_emotion_recognition",
          label: "Emotion recognition",
          helper:
            "Used to infer emotional states from biometric signals such as facial expressions, voice tone, or body language.",
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
        "The system manages or supports essential infrastructure where failure could affect health, safety, or access to essential services.",
      triggers: [
        "Electricity, water, gas, or heating systems",
        "Traffic and transport control",
        "Critical digital infrastructure",
      ],
      subUseCases: [
        {
          id: "infra_safety_component",
          label: "Safety component for utilities or road traffic",
          helper:
            "Used as a safety component in the management or operation of road traffic, or the supply of water, gas, heating, or electricity.",
          annexRef: "III-2(a)",
        },
        {
          id: "infra_digital",
          label: "Safety component for critical digital infrastructure",
          helper:
            "Used as a safety component in the management or operation of critical digital infrastructure.",
          annexRef: "III-2(b)",
        },
      ],
    },
    {
      id: "education",
      annexPoint: "Point 3",
      title: "Education and vocational training",
      description:
        "The system influences access to education or evaluates learning outcomes.",
      triggers: [
        "Admissions or selection decisions",
        "Exam scoring or grading",
        "Remote proctoring",
      ],
      subUseCases: [
        {
          id: "edu_admission",
          label: "Admissions and placement",
          helper:
            "Used to determine access to or admission into educational or vocational training institutions.",
          annexRef: "III-3(a)",
        },
        {
          id: "edu_learning_outcomes",
          label: "Evaluating learning outcomes",
          helper:
            "Used to evaluate learning outcomes, including when those outcomes steer the learning process.",
          annexRef: "III-3(b)",
        },
        {
          id: "edu_level_assessment",
          label: "Assessing appropriate level of education",
          helper:
            "Used to assess the appropriate level of education a person will receive or be able to access.",
          annexRef: "III-3(c)",
        },
        {
          id: "edu_proctoring",
          label: "Exam proctoring",
          helper:
            "Used to monitor and detect prohibited behaviour during tests.",
          annexRef: "III-3(d)",
        },
      ],
    },
    {
      id: "employment",
      annexPoint: "Point 4",
      title: "Employment and worker management",
      description:
        "The system is used in hiring, evaluating, promoting, monitoring, or managing workers.",
      triggers: [
        "Candidate screening or ranking",
        "Performance evaluation",
        "Task allocation based on behaviour or traits",
      ],
      subUseCases: [
        {
          id: "emp_recruitment",
          label: "Recruitment and candidate evaluation",
          helper:
            "Used to place job ads, screen or filter applications, or evaluate candidates.",
          annexRef: "III-4(a)",
        },
        {
          id: "emp_work_decisions",
          label: "Work decisions and performance monitoring",
          helper:
            "Used to make decisions about terms of work, promotion, termination, task allocation, or to monitor and evaluate worker behaviour or performance.",
          annexRef: "III-4(b)",
        },
      ],
    },
    {
      id: "essential_services",
      annexPoint: "Point 5",
      title: "Access to essential services and benefits",
      description:
        "The system affects access to services people depend on, such as credit, insurance, public benefits, or emergency services.",
      triggers: [
        "Credit scoring",
        "Insurance pricing or risk assessment",
        "Eligibility for public benefits",
        "Emergency call triage",
      ],
      subUseCases: [
        {
          id: "svc_public_benefits",
          label: "Public benefits eligibility",
          helper:
            "Used to evaluate eligibility for public assistance benefits and services, or to grant, reduce, revoke, or reclaim such benefits.",
          annexRef: "III-5(a)",
        },
        {
          id: "svc_creditworthiness",
          label: "Creditworthiness and credit scoring",
          helper:
            "Used to evaluate creditworthiness or establish credit scores.",
          annexRef: "III-5(b)",
        },
        {
          id: "svc_financial_fraud_only",
          label: "Financial fraud detection only",
          helper:
            "Used solely to detect financial fraud, not to score creditworthiness. This is explicitly excluded from high-risk.",
          annexRef: "III-5(b) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
        {
          id: "svc_insurance",
          label: "Life and health insurance risk and pricing",
          helper:
            "Used to assess risk or set pricing for life or health insurance for natural persons.",
          annexRef: "III-5(c)",
        },
        {
          id: "svc_emergency",
          label: "Emergency response triage",
          helper:
            "Used to evaluate or classify emergency calls, or to dispatch or prioritise first-response services, including emergency healthcare triage.",
          annexRef: "III-5(d)",
        },
      ],
    },
    {
      id: "law_enforcement",
      annexPoint: "Point 6",
      title: "Law enforcement",
      description:
        "The system supports law enforcement decisions, investigations, or risk assessment.",
      triggers: [
        "Risk assessment",
        "Evidence analysis",
        "Predictive support in investigations",
      ],
      subUseCases: [
        {
          id: "le_victim_risk",
          label: "Victim risk assessment",
          helper:
            "Used to assess the risk of a person becoming a victim of criminal offences.",
          annexRef: "III-6(a)",
        },
        {
          id: "le_polygraph",
          label: "Polygraphs in investigations",
          helper:
            "Used as a polygraph or similar tool during criminal investigations or proceedings.",
          annexRef: "III-6(b)",
        },
        {
          id: "le_evidence",
          label: "Evidence reliability evaluation",
          helper:
            "Used to evaluate the reliability of evidence during criminal investigations or proceedings.",
          annexRef: "III-6(c)",
        },
        {
          id: "le_reoffending",
          label: "Reoffending risk assessment",
          helper:
            "Used to assess the risk of a person offending or reoffending, based on more than profiling alone.",
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
            "Used to profile natural persons during the detection, investigation, or prosecution of criminal offences.",
          annexRef: "III-6(e)",
        },
      ],
    },
    {
      id: "migration",
      annexPoint: "Point 7",
      title: "Migration, asylum, and border control",
      description:
        "The system is used in visa, asylum, migration, or border-control contexts.",
      triggers: [
        "Visa or asylum processing",
        "Border risk assessment",
        "Identity verification in migration procedures",
      ],
      subUseCases: [
        {
          id: "mig_polygraph",
          label: "Polygraphs in migration interviews",
          helper:
            "Used as a polygraph or similar tool during migration interviews.",
          annexRef: "III-7(a)",
        },
        {
          id: "mig_risk_assessment",
          label: "Migration risk assessment",
          helper:
            "Used to assess security, irregular migration, or health risks posed by a person intending to enter, or having entered, the EU.",
          annexRef: "III-7(b)",
        },
        {
          id: "mig_application",
          label: "Asylum, visa, and residence permit processing",
          helper:
            "Used to examine or assist with applications for asylum, visa, or residence permits, and associated complaints.",
          annexRef: "III-7(c)",
        },
        {
          id: "mig_identification",
          label: "Border identification of persons",
          helper:
            "Used to detect, recognise, or identify natural persons in the context of border management, excluding travel document verification.",
          annexRef: "III-7(d)",
        },
        {
          id: "mig_travel_doc_only",
          label: "Travel document verification only",
          helper:
            "Used solely to verify travel documents. This is explicitly excluded from high-risk.",
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
        "The system supports judicial decisions or influences democratic participation.",
      triggers: [
        "Assisting legal interpretation or judicial reasoning",
        "Influencing voting behaviour or referendum outcomes",
      ],
      subUseCases: [
        {
          id: "justice_legal_research",
          label: "Judicial research and interpretation",
          helper:
            "Used to assist judicial authorities in researching and interpreting facts and the law, or in alternative dispute resolution.",
          annexRef: "III-8(a)",
        },
        {
          id: "justice_elections",
          label: "Influencing elections or voter behaviour",
          helper:
            "Used to influence the outcome of an election or referendum, or the voting behaviour of persons exercising their vote.",
          annexRef: "III-8(b)",
        },
        {
          id: "justice_campaign_admin_only",
          label: "Campaign logistics only",
          helper:
            "Used solely to organise, optimise, or structure political campaign logistics with no direct voter exposure. This is explicitly excluded from high-risk.",
          annexRef: "III-8(b) exclusion",
          excludesFromHighRisk: true,
          isExclusionGate: true,
        },
      ],
    },
  ],
};

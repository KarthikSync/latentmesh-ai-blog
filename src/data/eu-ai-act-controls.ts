export interface Control {
  id: string;
  cluster: string;
  role: "Provider" | "Deployer";
  owner: string;
  cadence: string;
  articles: string[];
  evidenceType: string;
  obligation: string;
  articleRef: string;
  controlObjective: string;
  evalVerification: string;
  evidenceArtifact: string;
  frameworks: string;
  interpretationNotes: string;
  crossReferences: string;
}

export interface ClusterMeta {
  key: string;
  title: string;
  articles: string;
}

export const CLUSTERS: ClusterMeta[] = [
  {
    "key": "risk-management",
    "title": "Risk Management",
    "articles": "Art. 9"
  },
  {
    "key": "data-governance",
    "title": "Data Governance",
    "articles": "Art. 10"
  },
  {
    "key": "technical-documentation",
    "title": "Technical Documentation",
    "articles": "Art. 11, Annex IV"
  },
  {
    "key": "logging-traceability",
    "title": "Logging and Traceability",
    "articles": "Art. 12, Art. 26(6)"
  },
  {
    "key": "transparency",
    "title": "Transparency",
    "articles": "Art. 13"
  },
  {
    "key": "human-oversight",
    "title": "Human Oversight",
    "articles": "Art. 14, Art. 26(2)"
  },
  {
    "key": "accuracy-robustness-cybersecurity",
    "title": "Accuracy, Robustness and Cybersecurity",
    "articles": "Art. 15"
  },
  {
    "key": "post-market-incidents",
    "title": "Post-Market Monitoring and Incidents",
    "articles": "Arts. 26-27, 72-73"
  }
];

export const CONTROLS: Control[] = [
  {
    "id": "r1",
    "cluster": "risk-management",
    "role": "Provider",
    "owner": "Safety",
    "cadence": "Pre-release",
    "articles": [
      "9"
    ],
    "evidenceType": "documentation",
    "obligation": "Identify and analyze known and foreseeable risks",
    "articleRef": "Art. 9(2)(a)-(b)",
    "controlObjective": "Documented risk register covers health, safety, and fundamental rights risks for intended use and reasonably foreseeable misuse",
    "evalVerification": "Red-team exercise targeting identified risk categories; structured review against threat taxonomy",
    "evidenceArtifact": "Risk register with severity ratings, test coverage mapping, review sign-off",
    "frameworks": "NIST AI RMF: Map (MP 3-5) · ISO 42001: 6.1.2",
    "interpretationNotes": "Art. 9(2)(a) requires identification of \"known and reasonably foreseeable risks\" to health, safety, and fundamental rights. Art. 9(2)(b) separately addresses risk estimation and evaluation \"when the high-risk AI system is used in accordance with its intended purpose and under conditions of reasonably foreseeable misuse.\" Risk registers that cover only intended use miss the 9(2)(b) obligation.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/mapping-the-eu-ai-act-to-engineering-evidence\">Essay #9</a> on provider obligation structure. <a href=\"https://latentmesh.ai/blog/the-accountability-gap-in-agent-chains\">Essay #4</a> on risk in multi-agent chains.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r2",
    "cluster": "risk-management",
    "role": "Provider",
    "owner": "Applied AI",
    "cadence": "Per-change",
    "articles": [
      "9"
    ],
    "evidenceType": "documentation",
    "obligation": "Adopt risk management measures",
    "articleRef": "Art. 9(2)(d), 9(7)",
    "controlObjective": "Each identified risk has a corresponding mitigation measure; residual risk is within acceptable thresholds",
    "evalVerification": "Traceability matrix linking risk register entries to implemented mitigations; residual risk assessment per change",
    "evidenceArtifact": "Risk-to-control traceability matrix, residual risk scores, mitigation test results",
    "frameworks": "NIST AI RMF: Manage (MG 1-2) · ISO 42001: 6.1.4",
    "interpretationNotes": "Art. 9(7) establishes a priority order: elimination through design first, then reduction, then information and training. Teams must document why elimination was not feasible before relying on downstream mitigations.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/controls-are-not-guardrails\">Essay #3</a> on guardrails vs. controls.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r3",
    "cluster": "risk-management",
    "role": "Provider",
    "owner": "Applied AI",
    "cadence": "Pre-release",
    "articles": [
      "9"
    ],
    "evidenceType": "test-results",
    "obligation": "Test for consistent performance and compliance",
    "articleRef": "Art. 9(5)-(6)",
    "controlObjective": "Testing demonstrates system performs consistently for intended purpose and meets requirements of Arts. 9-15",
    "evalVerification": "Pre-release eval suite covering accuracy, safety, fairness, and robustness; results compared to declared performance levels",
    "evidenceArtifact": "Eval run results, pass/fail summary, comparison against declared metrics",
    "frameworks": "NIST AI RMF: Measure (MS 1-2) · ISO 42001: 9.1",
    "interpretationNotes": "Art. 9(6) specifies testing \"at any time throughout the development process, and, in any event, prior to the placing on the market or the putting into service.\" Testing is not a gate at the end; it must be integrated throughout development.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-eval-gap\">Essay #2</a> on the eval gap. <a href=\"https://latentmesh.ai/blog/building-an-eval-harness-that-survives-production\">C1</a> on harness architecture (loader/runner/scorer separation).<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r4",
    "cluster": "risk-management",
    "role": "Provider",
    "owner": "Compliance",
    "cadence": "Pre-release",
    "articles": [
      "9"
    ],
    "evidenceType": "documentation",
    "obligation": "Communicate residual risks to deployers",
    "articleRef": "Art. 9(4)",
    "controlObjective": "Instructions for use include residual risks and any required deployer-side mitigations",
    "evalVerification": "Documentation review: residual risk register cross-referenced against deployer instructions",
    "evidenceArtifact": "Deployer instructions with residual risk section, sign-off from documentation review",
    "frameworks": "NIST AI RMF: Govern (GV 4) · ISO 42001: 8.4",
    "interpretationNotes": "This creates a handoff dependency: the deployer's ability to comply with Art. 26 depends on receiving accurate residual risk information from the provider. Gaps here cascade into deployer non-compliance.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/anatomy-of-an-evidence-pack\">Essay #8</a> on evidence pack structure.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r5",
    "cluster": "data-governance",
    "role": "Provider",
    "owner": "Applied AI",
    "cadence": "Per-change",
    "articles": [
      "10"
    ],
    "evidenceType": "documentation",
    "obligation": "Establish governance practices for training, validation, and test data",
    "articleRef": "Art. 10(2)",
    "controlObjective": "Data management practices cover collection, labeling, cleaning, enrichment, and aggregation with documented choices at each stage",
    "evalVerification": "Data lineage audit; schema validation checks on training and evaluation datasets",
    "evidenceArtifact": "Data governance documentation, lineage records, dataset version manifests",
    "frameworks": "NIST AI RMF: Map (MP 2) · ISO 42001: A.7.4",
    "interpretationNotes": "Art. 10(2) lists specific governance practices including design choices, data collection processes, and preparation operations such as annotation and labeling. \"Governance\" here is operational, not just policy.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/drift-is-the-default\">Essay #5</a> on data dependency drift. <a href=\"https://latentmesh.ai/blog/drift-detection-patterns-for-production-agents\">C4</a> on detection patterns.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r6",
    "cluster": "data-governance",
    "role": "Provider",
    "owner": "Safety",
    "cadence": "Pre-release",
    "articles": [
      "10"
    ],
    "evidenceType": "test-results",
    "obligation": "Examine datasets for biases",
    "articleRef": "Art. 10(2)(f)",
    "controlObjective": "Datasets examined for possible biases likely to affect health, safety, or lead to discrimination",
    "evalVerification": "Bias-specific evals across protected attributes; distributional analysis of training data",
    "evidenceArtifact": "Bias evaluation report with methodology, metrics, findings, and mitigation actions",
    "frameworks": "NIST AI RMF: Measure (MS 2.6-2.11) · ISO 42001: A.9.3",
    "interpretationNotes": "The threshold is \"possible biases that are likely to affect the health and safety of persons, have a negative impact on fundamental rights or lead to discrimination.\" Possibility and likelihood, not proof. Absence of evidence is not sufficient.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-eval-gap\">Essay #2</a> on capability vs. safety evals.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r7",
    "cluster": "data-governance",
    "role": "Provider",
    "owner": "Applied AI",
    "cadence": "Per-change",
    "articles": [
      "10"
    ],
    "evidenceType": "test-results",
    "obligation": "Ensure data relevance, representativeness, and correctness",
    "articleRef": "Art. 10(3)",
    "controlObjective": "Training data is relevant to intended purpose, sufficiently representative, and free of errors to the degree possible",
    "evalVerification": "Coverage analysis against intended deployment population; data quality checks",
    "evidenceArtifact": "Data quality report, coverage metrics, error rate analysis",
    "frameworks": "NIST AI RMF: Map (MP 2.3) · ISO 42001: A.7.5",
    "interpretationNotes": "Art. 10(3) uses \"to the best extent possible\": a proportionality standard. Document what measures were taken and why further improvement was impractical.",
    "crossReferences": "<a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r8",
    "cluster": "technical-documentation",
    "role": "Provider",
    "owner": "Compliance",
    "cadence": "Pre-release",
    "articles": [
      "11"
    ],
    "evidenceType": "documentation",
    "obligation": "Draw up and maintain technical documentation",
    "articleRef": "Art. 11(1), Annex IV",
    "controlObjective": "Technical documentation exists before market placement, covers all Annex IV requirements, and is kept up to date",
    "evalVerification": "Completeness checklist against Annex IV elements; periodic documentation review",
    "evidenceArtifact": "Technical documentation package, completeness checklist with sign-off, revision history",
    "frameworks": "NIST AI RMF: Govern (GV 1) · ISO 42001: 7.5",
    "interpretationNotes": "Annex IV specifies contents including general description, design specifications, development process, monitoring and testing, risk management, changes, performance metrics, and cybersecurity measures. Substantially more comprehensive than a model card.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/anatomy-of-an-evidence-pack\">Essay #8</a> on evidence pack structure (maps to a subset of Annex IV).<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r9",
    "cluster": "technical-documentation",
    "role": "Provider",
    "owner": "Compliance",
    "cadence": "Per-change",
    "articles": [
      "11"
    ],
    "evidenceType": "documentation",
    "obligation": "Keep documentation current throughout lifecycle",
    "articleRef": "Art. 11(1)",
    "controlObjective": "Documentation reflects current system state; changes trigger updates within defined SLA",
    "evalVerification": "Change log cross-referenced against documentation revisions; timestamp audit",
    "evidenceArtifact": "Documentation revision history, change-to-update mapping, staleness audit report",
    "frameworks": "NIST AI RMF: Govern (GV 1.2) · ISO 42001: 7.5.3",
    "interpretationNotes": "The \"kept up to date\" requirement is one of the most operationally demanding provisions. Without automation, documentation staleness is the default.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/drift-is-the-default\">Essay #5</a> on drift. <a href=\"https://latentmesh.ai/blog/drift-detection-patterns-for-production-agents\">C4</a> on detection patterns.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r10",
    "cluster": "logging-traceability",
    "role": "Provider",
    "owner": "Platform Eng",
    "cadence": "Pre-release",
    "articles": [
      "12"
    ],
    "evidenceType": "test-results",
    "obligation": "Design system for automatic event logging",
    "articleRef": "Art. 12(1)-(2)",
    "controlObjective": "System technically allows automatic recording of events relevant to risk identification, post-market monitoring, and operation monitoring",
    "evalVerification": "Log completeness tests: trigger known events, verify they appear in structured logs with required fields",
    "evidenceArtifact": "Log schema specification, completeness test results, sample structured logs",
    "frameworks": "NIST AI RMF: Measure (MS 4) · ISO 42001: A.7.2",
    "interpretationNotes": "Art. 12 requires the system to \"technically allow\" automatic logging: a design obligation on the provider. The Act does not prescribe a specific schema. For agentic systems, structured logging of inputs, outputs, tool calls, versions, human interventions, and operational context exceeds the statutory minimum but is the safest path to meeting traceability standards.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/what-your-agent-logged-vs-what-the-auditor-needed\">C3</a> on the gap between what teams capture and what auditors need.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r11",
    "cluster": "logging-traceability",
    "role": "Deployer",
    "owner": "Ops",
    "cadence": "Continuous",
    "articles": [
      "12",
      "26"
    ],
    "evidenceType": "monitoring",
    "obligation": "Retain logs and provide access for monitoring",
    "articleRef": "Art. 12(1), Art. 26(6)",
    "controlObjective": "Logs retained for minimum 6 months (per Art. 26(6), subject to applicable law) and accessible for compliance monitoring",
    "evalVerification": "Log retention audit: verify logs from N months ago are retrievable, complete, and unaltered",
    "evidenceArtifact": "Retention policy document, retrieval test results, access control records",
    "frameworks": "NIST AI RMF: Govern (GV 1.1) · ISO 42001: A.6.2.3",
    "interpretationNotes": "Art. 26(6) places the retention duty on the deployer. The six-month minimum is subject to applicable Union or national law. Deployers must ensure logs remain under their control and are not solely stored in provider infrastructure without access guarantees.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/what-your-agent-logged-vs-what-the-auditor-needed\">C3</a> on operational logs vs. audit-ready evidence.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r12",
    "cluster": "transparency",
    "role": "Provider",
    "owner": "Product",
    "cadence": "Pre-release",
    "articles": [
      "13"
    ],
    "evidenceType": "test-results",
    "obligation": "Design system so deployers can interpret output appropriately",
    "articleRef": "Art. 13(1)",
    "controlObjective": "System output includes sufficient context for deployers to interpret results and use them appropriately",
    "evalVerification": "Interpretability assessment: present outputs to deployer-representative users, measure comprehension",
    "evidenceArtifact": "Interpretability test results, deployer comprehension scores, output format specification",
    "frameworks": "NIST AI RMF: Map (MP 5) · ISO 42001: A.8.2",
    "interpretationNotes": "A design obligation: the system must be built to be interpretable, not merely documented after the fact. \"Appropriate\" interpretation, not complete explainability.",
    "crossReferences": "<a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r13",
    "cluster": "transparency",
    "role": "Provider",
    "owner": "Compliance",
    "cadence": "Pre-release",
    "articles": [
      "13"
    ],
    "evidenceType": "documentation",
    "obligation": "Provide instructions for use covering capabilities, limitations, and risks",
    "articleRef": "Art. 13(2)-(3)",
    "controlObjective": "Instructions cover provider identity, system characteristics, performance metrics, known limitations, human oversight measures, expected lifetime, and maintenance",
    "evalVerification": "Completeness checklist against Art. 13(3) requirements; deployer comprehension review",
    "evidenceArtifact": "Instructions for use document, completeness checklist, revision history",
    "frameworks": "NIST AI RMF: Govern (GV 4) · ISO 42001: A.8.4",
    "interpretationNotes": "Art. 13(3)(b)(ii) requires disclosure of \"known or foreseeable circumstances... which may lead to risks.\" A continuing disclosure obligation as new risks are discovered post-deployment.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/mapping-the-eu-ai-act-to-engineering-evidence\">Essay #9</a> on transparency obligations.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r14",
    "cluster": "human-oversight",
    "role": "Provider",
    "owner": "Platform Eng",
    "cadence": "Pre-release",
    "articles": [
      "14"
    ],
    "evidenceType": "test-results",
    "obligation": "Design system to allow effective human oversight",
    "articleRef": "Art. 14(1)-(2)",
    "controlObjective": "System includes mechanisms enabling oversight persons to monitor operation and intervene during period of use",
    "evalVerification": "Oversight workflow test: simulate scenarios requiring intervention, verify mechanisms function correctly",
    "evidenceArtifact": "Oversight mechanism specification, intervention test results, workflow documentation",
    "frameworks": "NIST AI RMF: Govern (GV 3) · ISO 42001: A.8.5",
    "interpretationNotes": "Art. 14(2): oversight aims to \"prevent or minimise the risks to health, safety or fundamental rights.\" A design obligation: the system must be built for oversight, not merely accompanied by a process document.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/from-obligation-to-evidence-in-90-minutes\">C2</a> walks the Article 14 loop end to end.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r15",
    "cluster": "human-oversight",
    "role": "Provider",
    "owner": "Platform Eng",
    "cadence": "Pre-release",
    "articles": [
      "14"
    ],
    "evidenceType": "test-results",
    "obligation": "Enable override, reversal, and interruption of system output",
    "articleRef": "Art. 14(4)(d)-(e)",
    "controlObjective": "Oversight person can decide not to use the system, disregard, override, or reverse its output, and interrupt operation via a stop mechanism",
    "evalVerification": "Override capability test: trigger override/stop actions, verify system responds; log capture test for override events",
    "evidenceArtifact": "Override mechanism test results, stop-button test results, override event log samples",
    "frameworks": "NIST AI RMF: Govern (GV 3.2) · ISO 42001: A.8.5",
    "interpretationNotes": "Art. 14(4)(d): \"not to use the high-risk AI system or to otherwise disregard, override or reverse the output.\" Art. 14(4)(e) adds \"interrupt the operation\" via a stop mechanism. The logging requirements for proving these rights are exercisable sit in Art. 12 and Annex IV, not Art. 14 itself.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/from-obligation-to-evidence-in-90-minutes\">C2</a> on Article 14. <a href=\"https://latentmesh.ai/blog/what-your-agent-logged-vs-what-the-auditor-needed\">C3</a> on logging gap.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r16",
    "cluster": "human-oversight",
    "role": "Deployer",
    "owner": "Ops",
    "cadence": "Continuous",
    "articles": [
      "14",
      "26"
    ],
    "evidenceType": "process",
    "obligation": "Assign competent oversight persons",
    "articleRef": "Art. 14(4), Art. 26(2)",
    "controlObjective": "Persons assigned to oversight have necessary competence, training, and authority; understand system capabilities and limitations",
    "evalVerification": "Role assignment records; competence assessment against provider instructions; periodic training verification",
    "evidenceArtifact": "Oversight assignment records, training completion logs, competence assessment results",
    "frameworks": "NIST AI RMF: Govern (GV 3.1) · ISO 42001: 7.2",
    "interpretationNotes": "Art. 26(2): assign oversight \"to natural persons who have the necessary competence, training and authority.\" Competence must be assessed and documented. The deployer cannot outsource this to the provider.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-accountability-gap-in-agent-chains\">Essay #4</a> on accountability gaps.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r17",
    "cluster": "accuracy-robustness-cybersecurity",
    "role": "Provider",
    "owner": "Applied AI",
    "cadence": "Pre-release",
    "articles": [
      "15"
    ],
    "evidenceType": "test-results",
    "obligation": "Achieve and declare appropriate accuracy levels",
    "articleRef": "Art. 15(1)-(2)",
    "controlObjective": "System achieves accuracy levels appropriate to intended purpose; levels declared in instructions for use",
    "evalVerification": "Accuracy eval suite across intended use scenarios; results compared to declared thresholds; confidence intervals",
    "evidenceArtifact": "Accuracy evaluation report, declared performance metrics, eval dataset descriptions",
    "frameworks": "NIST AI RMF: Measure (MS 1) · ISO 42001: A.9.2",
    "interpretationNotes": "\"Appropriate\" is not defined quantitatively. The provider determines levels based on intended purpose and risks. The key obligation is transparency: declared accuracy must match tested accuracy.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-eval-gap\">Essay #2</a> on benchmarks vs. production. <a href=\"https://latentmesh.ai/blog/building-an-eval-harness-that-survives-production\">C1</a> on harness architecture.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r18",
    "cluster": "accuracy-robustness-cybersecurity",
    "role": "Provider",
    "owner": "Applied AI",
    "cadence": "Per-change",
    "articles": [
      "15"
    ],
    "evidenceType": "test-results",
    "obligation": "Ensure resilience against errors, faults, and inconsistencies",
    "articleRef": "Art. 15(3)",
    "controlObjective": "System maintains performance under errors, faults, or inconsistencies in inputs or environment",
    "evalVerification": "Robustness eval: inject malformed inputs, simulate tool failures, verify graceful degradation",
    "evidenceArtifact": "Robustness test results, fault injection logs, degradation behavior documentation",
    "frameworks": "NIST AI RMF: Measure (MS 2.4) · ISO 42001: A.9.4",
    "interpretationNotes": "Art. 15(3) includes \"inconsistencies within or among the components of the high-risk AI system or its environment.\" For agentic systems: test when tools return unexpected responses, retrieval indices change, or upstream dependencies shift.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/agent-failures-are-distributed-systems-failures\">Essay #1</a> on distributed systems failures. <a href=\"https://latentmesh.ai/blog/drift-is-the-default\">Essay #5</a> on drift.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r19",
    "cluster": "accuracy-robustness-cybersecurity",
    "role": "Provider",
    "owner": "Platform Eng",
    "cadence": "Continuous",
    "articles": [
      "15"
    ],
    "evidenceType": "test-results",
    "obligation": "Protect against unauthorized alteration; include fail-safe measures",
    "articleRef": "Art. 15(4)-(5)",
    "controlObjective": "System is resilient against unauthorized attempts to alter its use or performance; technical redundancy and fail-safe measures in place",
    "evalVerification": "Adversarial testing (prompt injection, data poisoning, model extraction); fail-safe trigger tests",
    "evidenceArtifact": "Adversarial test results, security assessment report, fail-safe documentation and test logs",
    "frameworks": "NIST AI RMF: Manage (MG 2.5) · ISO 42001: A.9.5",
    "interpretationNotes": "Art. 15(4) covers both traditional cybersecurity and AI-specific attack vectors. For agentic systems, prompt injection and tool-use manipulation are within scope. Art. 15(5): \"technical redundancy solutions, which may include backup or fail-safe plans\": not just monitoring, but fallback mechanisms.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/controls-are-not-guardrails\">Essay #3</a> on guardrails vs. controls.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r20",
    "cluster": "post-market-incidents",
    "role": "Provider",
    "owner": "Safety",
    "cadence": "Continuous",
    "articles": [
      "72"
    ],
    "evidenceType": "monitoring",
    "obligation": "Establish post-market monitoring system",
    "articleRef": "Art. 72(1)-(2)",
    "controlObjective": "Proportionate system actively collects, documents, and analyzes relevant data throughout system lifetime",
    "evalVerification": "Monitoring coverage audit: verify data collection covers intended-purpose scenarios; review analysis cadence",
    "evidenceArtifact": "Post-market monitoring plan, data collection records, periodic analysis reports",
    "frameworks": "NIST AI RMF: Manage (MG 3-4) · ISO 42001: 10.1",
    "interpretationNotes": "Art. 72(2): \"actively and systematically\" collecting data. Passive log aggregation alone may not satisfy this. Must be \"proportionate to the nature of the AI technologies and the risks.\"",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/drift-detection-patterns-for-production-agents\">C4</a> on drift detection. <a href=\"https://latentmesh.ai/blog/the-incident-response-gap-in-ai-systems\">Essay #10</a> on incident response.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r21",
    "cluster": "post-market-incidents",
    "role": "Deployer",
    "owner": "Ops",
    "cadence": "Continuous",
    "articles": [
      "26"
    ],
    "evidenceType": "monitoring",
    "obligation": "Monitor operation based on provider instructions",
    "articleRef": "Art. 26(5)",
    "controlObjective": "Operational monitoring follows provider instructions; anomalies detected and acted upon",
    "evalVerification": "Monitoring implementation audit: verify deployer monitoring covers provider-specified indicators",
    "evidenceArtifact": "Monitoring configuration records, alert logs, anomaly response records",
    "frameworks": "NIST AI RMF: Manage (MG 3.1) · ISO 42001: 9.1",
    "interpretationNotes": "Art. 26(5): the deployer monitors \"on the basis of the instructions for use.\" If the provider's instructions are vague, the deployer's monitoring obligation is difficult to satisfy. Shared-responsibility chain.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-accountability-gap-in-agent-chains\">Essay #4</a> on accountability chains.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r22",
    "cluster": "post-market-incidents",
    "role": "Provider",
    "owner": "Compliance",
    "cadence": "Incident-triggered",
    "articles": [
      "73"
    ],
    "evidenceType": "incident",
    "obligation": "Report serious incidents to market surveillance authorities",
    "articleRef": "Art. 73(1), (4)-(5)",
    "controlObjective": "Serious incidents reported immediately after establishing a causal link, within 15 days at most",
    "evalVerification": "Incident classification test: simulate incidents, verify severity classification; tabletop exercise",
    "evidenceArtifact": "Incident response playbook, classification criteria, tabletop exercise records",
    "frameworks": "NIST AI RMF: Manage (MG 4) · ISO 42001: 10.2",
    "interpretationNotes": "Art. 73(4): initial report \"immediately after the provider has established a causal link\" or within 15 days. Art. 73(5): report must include all information necessary to determine severity. A team without a pre-established workflow cannot meet this timeline.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-incident-response-gap-in-ai-systems\">Essay #10</a> on incident response gap.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r23",
    "cluster": "post-market-incidents",
    "role": "Deployer",
    "owner": "Compliance",
    "cadence": "Incident-triggered",
    "articles": [
      "26"
    ],
    "evidenceType": "incident",
    "obligation": "Report incidents and notify provider immediately",
    "articleRef": "Art. 26(5)",
    "controlObjective": "Deployer informs provider and, where required by applicable law, the relevant authority upon awareness of a serious incident or malfunction",
    "evalVerification": "Incident escalation workflow test: simulate deployer-detected incidents, verify notification reaches provider",
    "evidenceArtifact": "Escalation workflow documentation, notification records, provider communication logs",
    "frameworks": "NIST AI RMF: Manage (MG 4) · ISO 42001: 10.2",
    "interpretationNotes": "The deployer's primary incident duty sits in Art. 26(5): inform the provider and, where applicable, the relevant authority. Art. 73 is principally a provider obligation; it applies to deployers only in limited circumstances, such as when the deployer cannot reach the provider. Both parties may need to report the same incident through different channels.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/the-incident-response-gap-in-ai-systems\">Essay #10</a> on incident response. <a href=\"https://latentmesh.ai/blog/the-accountability-gap-in-agent-chains\">Essay #4</a> on accountability.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r24",
    "cluster": "post-market-incidents",
    "role": "Deployer",
    "owner": "Compliance",
    "cadence": "Pre-release",
    "articles": [
      "27"
    ],
    "evidenceType": "documentation",
    "obligation": "Conduct fundamental rights impact assessment",
    "articleRef": "Art. 27(1)",
    "controlObjective": "Assessment covering elements in Art. 27(1)(a)-(f) completed before deployment",
    "evalVerification": "FRIA completeness review against Art. 27(1)(a)-(f) elements; legal and domain-expert review",
    "evidenceArtifact": "FRIA document, reviewer sign-off, notification to authority per Art. 27(3)",
    "frameworks": "NIST AI RMF: Map (MP 5) · ISO 42001: 6.1.2",
    "interpretationNotes": "Art. 27(1) applies to specific deployer categories: bodies governed by public law, private entities providing public services, and certain other listed categories. Not all deployers are required. Assessment contents: Art. 27(1)(a)-(f). Art. 27(3) separately requires notification. First assessment before first use; update when relevant changes occur.",
    "crossReferences": "<a href=\"https://latentmesh.ai/blog/mapping-the-eu-ai-act-to-engineering-evidence\">Essay #9</a> on deployer obligations.<br><a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  },
  {
    "id": "r25",
    "cluster": "post-market-incidents",
    "role": "Deployer",
    "owner": "Ops",
    "cadence": "Continuous",
    "articles": [
      "26"
    ],
    "evidenceType": "process",
    "obligation": "Inform workers and their representatives",
    "articleRef": "Art. 26(7)",
    "controlObjective": "Workers subject to the use of high-risk AI systems are informed, including worker representatives where relevant",
    "evalVerification": "Notification process audit: verify records exist and cover all affected roles",
    "evidenceArtifact": "Worker notification records, communication logs, representative acknowledgments",
    "frameworks": "NIST AI RMF: Govern (GV 4) · ISO 42001: 7.3",
    "interpretationNotes": "Art. 26(7): workers must be informed \"before being subject to the use of the system.\" New deployments, expanded use cases, or significant system changes trigger fresh notification. Interacts with Member State labor law.",
    "crossReferences": "<a href=\"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\" class=\"eur-lex-link\">Official text: Regulation (EU) 2024/1689</a>"
  }
];

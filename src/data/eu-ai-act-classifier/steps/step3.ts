// Step 3 — Annex I product safety (Art. 6(1))
// Three sequential conditions that must ALL be true for high_risk_annex_i.
// Compliance deadline: 2 August 2027.

import type { StepDef } from "../types";

export const STEP_3: StepDef = {
  id: "step3",
  title: "Is your AI system part of a regulated product?",
  shortLabel: "Product",
  intro:
    "AI that is a safety component of, or is itself, a product covered by specific EU product-safety legislation is automatically high-risk if it must undergo third-party conformity assessment.",
  questions: [
    {
      id: "is_safety_component_or_product",
      step: "step3",
      order: 0,
      type: "yes_no",
      prompt:
        "Is your AI system a safety component of a physical product, or is it the product itself?",
      why:
        "The Act treats AI embedded in regulated products differently from standalone AI software.",
      helper:
        "Examples: an AI system that controls braking in a vehicle, an AI diagnostic module in a medical device, or an AI component in industrial machinery.",
      legal: { article: "Art. 6(1)(a)" },
    },
    {
      id: "covered_by_annex_i_legislation",
      step: "step3",
      order: 1,
      type: "single_select",
      prompt: "Select the EU product-safety law that covers your product",
      why:
        "These are the specific EU harmonised laws listed in Annex I. If your product type appears in this list, the answer is Yes.",
      helper:
        "If you're unsure whether your product falls under one of these laws, your product compliance or legal team will know. Most consumer products sold in the EU carry a CE marking, which indicates they've been assessed under one of these frameworks.",
      legal: { article: "Art. 6(1)(a), Annex I" },
      showIf: (a) => a.is_safety_component_or_product === "yes",
      options: [
        { value: "none", label: "None / I don't know" },
        { value: "machinery", label: "Machinery products", subLabel: "Regulation 2023/1230" },
        { value: "toys", label: "Toys", subLabel: "Directive 2009/48/EC" },
        { value: "recreational_craft", label: "Recreational craft", subLabel: "Directive 2013/53/EU" },
        { value: "lifts", label: "Lifts and safety components", subLabel: "Directive 2014/33/EU" },
        { value: "atex", label: "Equipment for explosive atmospheres", subLabel: "Directive 2014/34/EU" },
        { value: "radio", label: "Radio equipment", subLabel: "Directive 2014/53/EU" },
        { value: "pressure", label: "Pressure equipment", subLabel: "Directive 2014/68/EU" },
        { value: "cableway", label: "Cableway installations", subLabel: "Regulation 2016/424" },
        { value: "ppe", label: "Personal protective equipment", subLabel: "Regulation 2016/425" },
        { value: "gas", label: "Gaseous fuel appliances", subLabel: "Regulation 2016/426" },
        { value: "medical_devices", label: "Medical devices", subLabel: "Regulation 2017/745" },
        { value: "ivd", label: "In vitro diagnostic medical devices", subLabel: "Regulation 2017/746" },
        { value: "civil_aviation", label: "Civil aviation", subLabel: "Regulation 2018/1139" },
        { value: "motor_vehicles", label: "Motor vehicles and trailers", subLabel: "Regulation 2018/858" },
        { value: "agricultural_vehicles", label: "Agricultural and forestry vehicles", subLabel: "Regulation 167/2013" },
        { value: "marine", label: "Marine equipment", subLabel: "Directive 2014/90/EU" },
        { value: "rail", label: "Rail interoperability", subLabel: "Directive 2016/797" },
      ],
    },
    {
      id: "requires_third_party_conformity",
      step: "step3",
      order: 2,
      type: "yes_no_unsure",
      prompt:
        "Under that product-safety law, is your product required to undergo a third-party conformity assessment (by a 'notified body') before being placed on the market?",
      why:
        "Not all regulated products need third-party assessment. Only those that do trigger high-risk under the AI Act.",
      helper:
        "Some products can self-certify. Your product compliance team will know which path applies.",
      legal: { article: "Art. 6(1)(b)" },
      showIf: (a) =>
        a.is_safety_component_or_product === "yes" &&
        typeof a.covered_by_annex_i_legislation === "string" &&
        a.covered_by_annex_i_legislation !== "none",
    },
  ],
};

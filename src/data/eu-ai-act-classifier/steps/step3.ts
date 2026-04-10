// Step 3 — Annex I product safety (Art. 6(1))
// Beginner-facing copy: "PRODUCT" — three sequential questions. The main
// question is a plain-English rewrite; Q2 (product-safety law picker) and
// Q3 (third-party conformity) are rewritten in the same tight voice with
// short consequence text.

import type { StepDef } from "../types";

export const STEP_3: StepDef = {
  id: "step3",
  title: "Is this AI system part of a regulated product?",
  shortLabel: "Product",
  intro:
    "AI that is itself a regulated product, or a safety component of one, may be high-risk under a separate route.",
  questions: [
    {
      id: "is_safety_component_or_product",
      step: "step3",
      order: 0,
      type: "yes_no",
      prompt:
        "Is this AI system itself a regulated product, or a safety component of one?",
      helper:
        "Examples include AI used in medical devices, vehicles, machinery, aviation, or other products covered by EU product-safety law.",
      why:
        "The Act treats AI embedded in regulated products differently from standalone AI software.",
      legal: { article: "Art. 6(1)(a)" },
    },
    {
      id: "covered_by_annex_i_legislation",
      step: "step3",
      order: 1,
      type: "single_select",
      prompt: "Which EU product-safety law covers this product?",
      helper:
        "If your product carries a CE marking, it is likely covered by one of these laws. Your product compliance team will know. If none applies, choose 'None / I don't know'.",
      why:
        "Annex I lists the specific EU harmonised laws that can trigger high-risk classification when combined with third-party conformity assessment.",
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
        "Does that product-safety law require your product to be assessed by a third-party notified body before being placed on the market?",
      helper:
        "Not all regulated products need third-party assessment — some can self-certify. If you are unsure, check with your product compliance team.",
      why:
        "If yes, this system is treated as high-risk under Annex I. Only products that undergo third-party conformity assessment trigger high-risk under this route.",
      legal: { article: "Art. 6(1)(b)" },
      showIf: (a) =>
        a.is_safety_component_or_product === "yes" &&
        typeof a.covered_by_annex_i_legislation === "string" &&
        a.covered_by_annex_i_legislation !== "none",
    },
  ],
};

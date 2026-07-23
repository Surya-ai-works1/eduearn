"use client";

import React from "react";
import { Container } from "./Container";
import { Accordion } from "../ui/accordion";

export function FaqSection() {
  const faqItems = [
    {
      id: "faq-learning",
      trigger: "How do I enroll in a course on EduEarn?",
      content: "Simply browse our categories catalog, select a course card, and click the enroll button. We offer various free peer-led modules and premium options with direct UPI checkout support.",
    },
    {
      id: "faq-teaching",
      trigger: "What are the requirements to register as a student tutor?",
      content: "Tutor registration is open to students and young professionals aged 16–24. Applicants must submit qualifications proof (school/college ID) and pass our automated AI assessment.",
    },
    {
      id: "faq-verification",
      trigger: "What does the AI-Verified badge mean?",
      content: "Tutors undergo an automated screening process evaluating their subject knowledge, communication, and teaching clarity. Passing tutors receive the AI badge on their cards.",
    },
    {
      id: "faq-payments",
      trigger: "How do student tutors receive their earnings?",
      content: "Tutors earn directly from course enrollments and live sessions. Earnings are credited instantly to your online wallet, withdrawable directly to bank accounts or UPI IDs.",
    },
    {
      id: "faq-certificates",
      trigger: "Will I get a verified certificate after completing a course?",
      content: "Yes! Every completed course offers a shareable verified certificate signed by the student educator and verified by the EduEarn platform board.",
    },
    {
      id: "faq-live",
      trigger: "How do live doubt rooms work?",
      content: "Once you reserve a seat for an upcoming live room, we'll email you a calendar invite. Live doubt sessions are interactive video calls with screen-sharing enabled.",
    },
    {
      id: "faq-refunds",
      trigger: "Is there a refund policy if I am not satisfied?",
      content: "Yes! We offer a hassle-free 3-day refund policy for all courses if you do not find the class content or student tutor communication satisfactory.",
    },
  ];

  return (
    <section className="w-full py-20 bg-background select-none">
      <Container className="flex flex-col gap-12 max-w-3xl">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quickly check our guidelines about peer learning, student payouts, and refund guarantees.
          </p>
        </div>

        {/* FAQs Accordion */}
        <Accordion items={faqItems} allowMultiple={false} className="border-border/60" />

      </Container>
    </section>
  );
}

export default FaqSection;

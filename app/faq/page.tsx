import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Vision Tester?",
    answer: "Vision Tester is a web application that helps developers and designers test their websites for accessibility by simulating various vision conditions. It provides real-time feedback and recommendations for improving website accessibility.",
  },
  {
    question: "How accurate are the vision simulations?",
    answer: "Our simulations are based on scientific research and medical understanding of various vision conditions. While they provide a good approximation, they are meant to be used as a tool for understanding and improving accessibility rather than as a medical diagnostic tool.",
  },
  {
    question: "Can I test any website?",
    answer: "Yes, you can test any publicly accessible website by entering its URL. You can also upload screenshots or images for testing.",
  },
  {
    question: "What vision conditions can be simulated?",
    answer: "We currently support simulations for color blindness (protanopia, deuteranopia, tritanopia), blurred vision, reduced contrast sensitivity, and complete color blindness (achromatopsia).",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with our service, contact our support team for a full refund.",
  },
  {
    question: "Can I change plans at any time?",
    answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will be reflected in your next billing cycle.",
  },
];

export default function FAQPage() {
  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about Vision Tester
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
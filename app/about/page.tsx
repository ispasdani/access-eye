import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-12 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Making the Web Accessible for Everyone
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Vision Tester helps developers and designers create more inclusive websites by simulating different vision conditions.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Why Vision Tester?</h2>
          <div className="space-y-4">
            {[
              "Real-time vision condition simulation",
              "Comprehensive accessibility testing",
              "Detailed reports and recommendations",
              "Easy-to-use interface",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <Button asChild>
            <Link href="/pricing">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="aspect-video bg-muted rounded-lg" />
      </section>
    </div>
  );
}
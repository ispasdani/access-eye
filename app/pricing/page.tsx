import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out our service",
    features: [
      "50 APIFlash screenshots per month",
      "10 Puppeteer screenshots per month",
      "Basic vision simulations",
      "Standard support",
      "1 user account"
    ],
  },
  {
    name: "Pro",
    price: "49",
    description: "Best for professionals and small teams",
    features: [
      "1000 APIFlash screenshots per month",
      "200 Puppeteer screenshots per month",
      "Advanced vision simulations",
      "Priority support",
      "API access",
      "Team collaboration",
      "5 user accounts"
    ],
  },
  {
    name: "Enterprise",
    price: "199",
    description: "For organizations with advanced needs",
    features: [
      "5000 APIFlash screenshots per month",
      "1000 Puppeteer screenshots per month",
      "All Pro features",
      "Custom integrations",
      "Dedicated support",
      "Training sessions",
      "Custom contracts",
      "Unlimited user accounts"
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
              Get Started
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
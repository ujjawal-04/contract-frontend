import { api } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function PricingSection() {
  const handleUpgrade = async() => {
    try {
      const response = await api.get("/payments/create-checkout-session");
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({
        sessionId: response.data.sessionId,
      })
    } catch (error)  {
     console.error(error);
    }
  };

  return (
    <section className="w-full py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Choose your plan</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Select the perfect plan for your needs, upgrade anytime to unlock premium features</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <PricingCard
              title="Basic"
              description="Perfect for getting started"
              price="$0"
              period="/Free"
              features={[
                "Basic contract analysis",
                "2 projects",
                "3 potential risks identified",
                "3 potential opportunities identified",
                "Brief contract summary",
                "Standard support",
                "Email support"
              ]}
              buttonText="Get Started"
              onButtonClick={() => window.location.href = "/dashboard"}
              highlight={false}
            />
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <PricingCard
              title="Premium"
              description="For comprehensive contract analysis"
              price="$20"
              period="/lifetime"
              features={[
                "Advanced contract analysis",
                "Unlimited projects",
                "Chat with your contract",
                "10+ opportunities with impact levels",
                "Comprehensive contract summary",
                "Improvement recommendations",
                "Key clauses identification",
                "Legal compliance assessment",
                "Negotiation points",
                "Priority support"
              ]}
              buttonText="Upgrade Now"
              onButtonClick={handleUpgrade}
              highlight={true}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string
  features: string[];
  buttonText: string;
  highlight?: boolean;
  onButtonClick: () => void;
}

function PricingCard({
  title,
  description,
  price,
  period,
  features,
  buttonText,
  highlight,
  onButtonClick,
} : PricingCardProps) {
  const animButtonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.98 }
  };

  return (
    <Card className={`h-full border ${highlight ? "border-blue-200 bg-blue-50 shadow-md" : "border-gray-200 bg-white shadow-sm"} rounded-xl p-0 overflow-hidden transition-all duration-300 hover:shadow-md`}>
      {highlight && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-bl">
          RECOMMENDED
        </div>
      )}
      <CardHeader className="pt-8 pb-2">
        <CardTitle className="text-xl font-bold mb-1">{title}</CardTitle>
        <CardDescription className="text-sm text-slate-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="flex items-baseline mb-6">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-slate-500 ml-1">{period}</span>
        </div>
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li className="flex items-center" key={index}>
              <CheckCircle2 className={`h-5 w-5 ${highlight ? "text-blue-500" : "text-blue-500"} mr-3 flex-shrink-0`} />
              <span className="text-sm text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
        <motion.div 
          whileHover="hover" 
          whileTap="tap" 
          variants={animButtonVariants}
        >
          <Button 
            className={`w-full ${highlight 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "border-blue-200 text-blue-600 hover:bg-blue-50"}`} 
            onClick={onButtonClick}
            variant={highlight ? "default" : "outline"}
          >
            {buttonText}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
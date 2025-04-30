"use client"

import {
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  AlertCircle,
  UsersRound,
  CircleDollarSign,
  ShieldCheck,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { PricingSection } from "./pricing-section"

// Features array with title, description and icon name
const features = [
  {
    title: "AI powered Analysis",
    description: "Leverage intelligence & AI to analyze contracts quickly and accurately",
    icon: Brain,
  },
  {
    title: "Risk identification",
    description: "Spot potential risks and opportunities in your contracts",
    icon: AlertCircle,
  },
  {
    title: "Streamlined negotiations",
    description: "Accelerate negotiation process with AI-driven insights",
    icon: UsersRound,
  },
  {
    title: "Cost reduction",
    description: "Significantly reduce legal costs through automation",
    icon: CircleDollarSign,
  },
  {
    title: "Improved compliance",
    description: "Ensure your contracts meet all regulatory requirements",
    icon: ShieldCheck,
  },
  {
    title: "Faster Turnaround",
    description: "Complete contract reviews in minutes instead of hours",
    icon: Clock,
  },
]

export function HeroSection() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const animButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  }

  // Grid background animation - moved from feature section to be used in header
  const gridVariants = {
    animate: {
      backgroundPosition: ["0px 0px", "100px 100px"],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section with Animated Grid Background */}
      <section className="w-full min-h-screen flex items-center justify-center py-12 md:py-16 lg:py-20 relative">
        {/* Added grid background here */}
        <motion.div
          className="absolute inset-0 z-0 opacity-10"
          variants={gridVariants}
          animate="animate"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 rounded-full"></div>

        <div className="container px-4 md:px-6 flex flex-col items-center max-w-6xl mx-auto relative z-10 rounded-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-full"
          >
            <motion.div
            className="rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(79, 70, 229, 0.2)",
                  "0 0 20px rgba(79, 70, 229, 0.4)",
                  "0 0 0 rgba(79, 70, 229, 0.2)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Link
                href={"/dashboard"}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "px-7 text-base py-5 mb-6 rounded-full border border-blue-200 flex items-center backdrop-blur-sm bg-blue-400/40 text-blue-700",
                )}
              >
                <motion.span
                  className="mr-2 text-blue-500"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  <Sparkles className="size-4.5" />
                </motion.span>
                Introducing simple metrics for your contracts
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center mb-12 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none text-slate-800 mb-4"
              variants={itemVariants}
            >
              <motion.span
                className="inline-block"
                animate={{
                  backgroundImage: [
                    "linear-gradient(45deg, #4f46e5, #4f46e5)",
                    "linear-gradient(45deg, #4f46e5, #06b6d4)",
                    "linear-gradient(45deg, #06b6d4, #4f46e5)",
                  ],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 200%",
                }}
              >
                Revolutionize
              </motion.span>{" "}
              your contract
              <br />
              analysis powered by AI
            </motion.h1>

            <motion.p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto" variants={itemVariants}>
              Harness the power of AI to analyze, understand, and optimize your contracts in minutes, not hours
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-16" variants={itemVariants}>
              <motion.div whileHover="hover" variants={animButtonVariants} whileTap={{ scale: 0.95 }}>
                <Link href={"/dashboard"}>
                  <Button
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group"
                    size={"lg"}
                  >
                    <motion.span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Get started</span>
                    <motion.span
                      className="relative z-10 ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                    >
                      <ArrowRight className="size-4" />
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover="hover" variants={animButtonVariants} whileTap={{ scale: 0.95 }}>
                <Button
                  className="inline-flex items-center justify-center border-blue-200 relative overflow-hidden group"
                  size={"lg"}
                  variant={"outline"}
                >
                  <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Watch Demo</span>
                  <motion.span
                    className="relative z-10 ml-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                  >
                    <Play className="size-4 fill-current" />
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview Image with enhanced animation */}
          <motion.div
            className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden relative"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20,
              delay: 0.5,
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 opacity-0 z-10"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />
            <motion.div
              className="bg-white rounded-xl shadow-2xl relative"
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                transition: { duration: 0.3 },
              }}
            >
              <motion.img
                src="/1.png"
                alt="Dashboard preview"
                className="w-full h-auto rounded-lg"
                initial={{ scale: 1.05, filter: "blur(5px)" }}
                animate={{ scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              {/* Floating elements for visual interest */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-white"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  delay: 1.2,
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="size-6" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - grid background removed since now it's in the header */}
      <section className="w-full py-16  relative">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h2
              className="text-3xl font-bold text-center mb-12 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Features
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              let iconColor
              let bgColor

              // Assign different colors to each feature card based on index
              switch (index) {
                case 0: // AI powered Analysis
                  iconColor = "text-indigo-600"
                  bgColor = "bg-indigo-100"
                  break
                case 1: // Risk identification
                  iconColor = "text-blue-600"
                  bgColor = "bg-blue-100"
                  break
                case 2: // Streamlined negotiations
                  iconColor = "text-purple-600"
                  bgColor = "bg-purple-100"
                  break
                case 3: // Cost reduction
                  iconColor = "text-pink-600"
                  bgColor = "bg-pink-100"
                  break
                case 4: // Improved compliance
                  iconColor = "text-amber-600"
                  bgColor = "bg-amber-100"
                  break
                case 5: // Faster Turnaround
                  iconColor = "text-emerald-600"
                  bgColor = "bg-emerald-100"
                  break
                default:
                  iconColor = "text-blue-600"
                  bgColor = "bg-blue-100"
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 50,
                  }}
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.2 },
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  className="h-full"
                >
                  <Card className="h-full border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                    {/* Animated gradient border on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 pointer-events-none"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent"
                        animate={{
                          background: [
                            "linear-gradient(90deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                            "linear-gradient(180deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                            "linear-gradient(270deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                            "linear-gradient(360deg, #4f46e5, #06b6d4, #4f46e5) border-box",
                          ],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                        style={{
                          borderRadius: "inherit",
                          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                          WebkitMaskComposite: "destination-out",
                          maskComposite: "exclude",
                        }}
                      />
                    </motion.div>

                    <CardHeader className="text-center pb-2">
                      <motion.div
                        className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full ${bgColor} mb-4 relative`}
                        whileHover={{
                          scale: 1.1,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.5 },
                        }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                        >
                          <IconComponent className={`h-7 w-7 ${iconColor}`} />
                        </motion.div>
                      </motion.div>
                      <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-500 text-center text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

       {/* Analysis Results Section with enhanced animations */}
       <section className="w-full py-16 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
        {/* Animated particles background */}
        <div className="absolute inset-0 z-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-500/10"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
              }}
              animate={{
                y: [null, Math.random() * 100 + "%"],
                x: [null, Math.random() * 100 + "%"],
              }}
              transition={{
                duration: Math.random() * 10 + 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "linear",
              }}
              style={{
                width: Math.random() * 100 + 50 + "px",
                height: Math.random() * 100 + 50 + "px",
              }}
            />
          ))}
        </div>

        <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-2"
            >
              <div className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                Powerful Insights
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-center mb-8 relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Contract Analysis result
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </motion.h2>

            {/* Analysis image with enhanced animations */}
            <motion.div
              className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden relative"
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                type: "spring",
                stiffness: 50,
              }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl border border-gray-100 relative"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                {/* Animated highlight effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                  }}
                  style={{
                    width: "50%",
                    borderRadius: "inherit",
                  }}
                />

                <div className="p-4">
                  <motion.img
                    src="/2.png"
                    alt="Contract analysis dashboard"
                    className="w-full h-auto rounded-lg"
                    initial={{ scale: 1.05, filter: "blur(5px)" }}
                    whileInView={{ scale: 1, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                {/* Floating elements for visual interest */}
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-white"
                  initial={{ scale: 0, rotate: 20 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: 1,
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Brain className="size-6" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

    </div>
  )
}

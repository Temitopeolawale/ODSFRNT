import React, { useEffect, useRef } from "react";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Section } from "../components/landing/Section";
import { FeatureCard } from "../components/landing/FeartureCard";
import { Button } from "../components/landing/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/landing/Card";
import { ChevronRight, Camera, MessageSquare, Eye, Shield, Zap } from "lucide-react";
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
    const sectionRefs = useRef([]);

  useEffect(() => {
    sectionRefs.current.forEach((section, index) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })
  }, [])

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#faq", label: "FAQ" },
  ]

  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "#features", label: "Features" },
        { href: "#how-it-works", label: "How It Works" },
        { href: "#faq", label: "FAQ" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", label: "About" },
        { href: "#", label: "Blog" },
        { href: "#", label: "Contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "#", label: "Terms" },
        { href: "#", label: "Privacy" },
        { href: "#", label: "Cookies" },
      ],
    },
  ]
  const navigate = useNavigate();

    const handleGetStartedClick = () => {
      navigate("/signup");
    };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Header navItems={navItems} logoText="VisionFlow" />
  
      <main className="flex-1">
        <Section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <section
            ref={(el) => (sectionRefs.current[0] = el)}
            className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden"
          >
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
                      VisionFlow – AI-Powered Image Understanding & Interaction
                    </h1>
                    <p className="max-w-[600px] text-gray-600 md:text-xl">
                      Analyze Images, Detect Objects, and Engage with AI
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button
                      size="lg"
                      className="gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Start Using VisionFlow <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JtksVOO5410v8PJ9ZGQ7G6AbmdVA52.png"
                    width={550}
                    height={550}
                    alt="AI Vision Detection Demo"
                    className="relative mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last border-2 border-purple-100 shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </section>
        </Section>
  
        <Section id="features" className="bg-white">
          <section
            ref={(el) => (sectionRefs.current[1] = el)}
            className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
          >
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
                    Key Features
                  </h2>
                  <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Discover the power of AI-driven image analysis with VisionFlow
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                  icon={Camera}
                  title="Instant AI Analysis"
                  description="Upload an image and receive real-time detection results."
                />
                <FeatureCard
                  icon={MessageSquare}
                  title="Conversational AI"
                  description="Ask questions about the image, and the AI will provide contextual insights."
                />
                <FeatureCard
                  icon={Eye}
                  title="Object & Gesture Recognition"
                  description="Detect hands, objects, and patterns with precision."
                />
                <FeatureCard
                  icon={Zap}
                  title="Summarized Results"
                  description="Get a clear and concise description of detected elements."
                />
                <FeatureCard
                  icon={Shield}
                  title="Privacy-Focused"
                  description="Your data is secure, with no unnecessary storage of personal images."
                />
                <FeatureCard
                  icon={Zap}
                  title="User-Friendly Interface"
                  description="Clean, intuitive, and efficient design for easy navigation."
                />
              </div>
            </div>
          </section>
        </Section>
  
        <Section id="how-it-works" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <section
            ref={(el) => (sectionRefs.current[2] = el)}
            className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
          >
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
                    How It Works
                  </h2>
                  <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Experience the seamless process of AI-powered image analysis
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-4">
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">1. Upload an Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Choose an image from your device for AI processing.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">2. AI-Powered Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      The system analyzes objects, gestures, and patterns in real-time.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">3. Conversational Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Ask follow-up questions to understand the image better.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">4. Save & Manage Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Keep track of previous analyses for reference.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </Section>
  
        <Section id="faq" className="bg-white">
          <section
            ref={(el) => (sectionRefs.current[3] = el)}
            className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
          >
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
                    Frequently Asked Questions
                  </h2>
                  <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Get answers to common questions about VisionFlow
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2">
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">What types of images can I upload?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      You can upload images containing objects, gestures, or general scenes. VisionFlow works best with
                      clear, high-quality images.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">
                      Can I ask follow-up questions after an image is analyzed?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Yes! VisionFlow supports interactive conversations, allowing you to ask about detected objects,
                      image details, or insights related to the analysis.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Is my uploaded image stored permanently?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      No, VisionFlow processes images in real-time and does not store them permanently, ensuring privacy
                      and security.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-purple-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Does VisionFlow work on mobile devices?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Yes, VisionFlow is fully responsive and works on both desktop and mobile browsers.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </Section>
  
        <Section className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
          <section
            ref={(el) => (sectionRefs.current[4] = el)}
            className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
          >
            <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
                    Start Using VisionFlow Today!
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Experience the power of AI-driven vision analysis with interactive insights.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                  onClick={handleGetStartedClick}
                    size="lg"
                    className="gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started Now <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                    Schedule a Demo
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </Section>
      </main>
  
      <Footer
        logoText="VisionFlow"
        description="AI-Powered Image Understanding & Interaction"
        sections={footerSections}
      />
    </div>
  )
}

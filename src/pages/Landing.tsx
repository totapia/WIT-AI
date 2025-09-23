import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Truck, Shield, BarChart3, MessageSquare, Users, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { login, signup, loading } = useUser();

  const handleSubmit = async () => {
    try {
      setError("");
      
      if (isSignup) {
        await signup(email, password, name);
        toast.success("Account created! Please check your email to confirm your account.");
        setIsSignup(false);
      } else {
        await login(email, password);
        navigate("/dashboard");
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
    }
  };

  const features = [
    {
      icon: Truck,
      title: "Smart Logistics Matching",
      description: "AI-powered algorithms match shippers with the perfect truckers at optimal prices"
    },
    {
      icon: Shield,
      title: "Secure Payment Management",
      description: "Handle all transactions safely with automated payment processing for both parties"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance, monitor KPIs, and get insights to improve your sales success"
    },
    {
      icon: MessageSquare,
      title: "AI Call Assistant",
      description: "Get real-time AI guidance during calls to maximize conversion rates and client satisfaction"
    }
  ];

  const stats = [
    { value: "2.5M+", label: "Shipments Managed" },
    { value: "98%", label: "Payment Success Rate" },
    { value: "45%", label: "Avg. Conversion Increase" },
    { value: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-accent animate-fade-in">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 animate-slide-down">
        <div className="w-full px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 hover-scale">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center animate-pulse">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              WIT Ai
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-all duration-300 story-link">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-all duration-300 story-link">Pricing</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-all duration-300 story-link">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full px-4 lg:px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left side - Title and description */}
        <div className="space-y-6">
          <div className="text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to{" "}
              <span className="text-primary">WIT Ai</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Work in Tandem AI - The AI-powered platform that helps you do the work of a thousand men, connecting shippers and carriers seamlessly while you focus on what matters most.
            </p>
          </div>

          {/* Action buttons moved below title and text */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button size="lg" variant="gradient" className="hover-scale" onClick={() => setIsSignup(true)}>
              Start Free Trial
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="hover-scale">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-6 lg:pt-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center counter-animate hover-scale" style={{animationDelay: `${0.1 * index}s`}}>
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login/Signup Panel */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {isSignup ? 'Create Account' : 'Sign In to WIT Ai'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isSignup ? 'Start your free trial today' : 'Access your logistics dashboard'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {isSignup && (
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}
                  
                  <Button 
                    onClick={handleSubmit}
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      onClick={() => setIsSignup(!isSignup)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isSignup 
                        ? 'Already have an account? Sign in' 
                        : "Don't have an account? Sign up"
                      }
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-muted/30 py-12 lg:py-20">
        <div className="w-full px-4 lg:px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features for Sales Success</h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to close more deals and manage logistics operations effectively
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-card border-t py-8 lg:py-12">
        <div className="w-full px-4 lg:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">WIT Ai</span>
              </div>
              <p className="text-muted-foreground mb-4">
                The future of logistics is here. Join thousands of brokers who trust WIT Ai to work in tandem with their operations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">News</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>sales@witai.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 WIT Ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
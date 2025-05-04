import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="bg-dark text-light">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-4">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-grey to-dark animate-gradient-xy opacity-70"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-32 w-32 bg-cyan-blue/5 rounded-full -top-16 -left-16 animate-float-slow"></div>
          <div className="absolute h-48 w-48 bg-cyan-blue/5 rounded-full top-1/2 -right-24 animate-float"></div>
          <div className="absolute h-24 w-24 bg-cyan-blue/5 rounded-full bottom-12 left-1/4 animate-float-fast"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2358c4dc' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8 inline-block">
     
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-blue via-light to-cyan-blue text-transparent bg-clip-text animate-gradient">
            Welcome to <span className="font-extrabold">Skill Hub</span>
          </h1>
          <p className="text-xl mb-12 text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Connect with top talent, find freelance jobs, and grow your business in our
            thriving community of professionals.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              to="/features"
              className="group relative px-8 py-4 rounded-lg font-medium overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-cyan-blue group-hover:bg-cyan-blue/80"></div>
              <span className="relative text-dark font-semibold">Get Started</span>
            </Link>
            <Link
              to="/about"
              className="group relative px-8 py-4 rounded-lg font-medium overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-grey group-hover:bg-grey/80"></div>
              <span className="relative text-light">Learn More</span>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-4 backdrop-blur-lg bg-grey/30 rounded-lg border border-grey">
              <div className="text-3xl font-bold text-cyan-blue">150+</div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="p-4 backdrop-blur-lg bg-grey/30 rounded-lg border border-grey">
              <div className="text-3xl font-bold text-cyan-blue">10k+</div>
              <div className="text-gray-400">Freelancers</div>
            </div>
            <div className="p-4 backdrop-blur-lg bg-grey/30 rounded-lg border border-grey">
              <div className="text-3xl font-bold text-cyan-blue">5k+</div>
              <div className="text-gray-400">Projects</div>
            </div>
            <div className="p-4 backdrop-blur-lg bg-grey/30 rounded-lg border border-grey">
              <div className="text-3xl font-bold text-cyan-blue">95%</div>
              <div className="text-gray-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gray-800 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Explore <span className="text-blue-400">150+ categories</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Categories Cards */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-colors duration-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Development</h3>
              <div className="space-y-3">
                <p className="text-gray-400">Website Design</p>
                <p className="text-gray-400">Mobile Apps</p>
                <p className="text-gray-400">Android Apps</p>
                <p className="text-gray-400">iPhone Apps</p>
                <p className="text-gray-400">Software Architecture</p>
              </div>
            </div>
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-colors duration-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Design</h3>
              <div className="space-y-3">
                <p className="text-gray-400">Graphic Design</p>
                <p className="text-gray-400">Logo Design</p>
                <p className="text-gray-400">UI/UX Design</p>
                <p className="text-gray-400">Brand Identity</p>
                <p className="text-gray-400">Illustration</p>
              </div>
            </div>
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-colors duration-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Writing</h3>
              <div className="space-y-3">
                <p className="text-gray-400">Content Writing</p>
                <p className="text-gray-400">Copywriting</p>
                <p className="text-gray-400">Technical Writing</p>
                <p className="text-gray-400">Translation</p>
                <p className="text-gray-400">Proofreading</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-900 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Freelancer",
                description: "Ideal for individual freelancers looking to showcase their skills and connect with clients.",
                price: "0.5% Commission",
                icon: "👨‍💻"
              },
              {
                title: "Hybrid",
                description: "A flexible service combining both freelance and enterprise, features to cater diverse project needs",
                price: "1.5% Commission",
                icon: "🏢"
              },
              {
                title: "Enterprise",
                description: "Designed for businesses and large enterprises seeking to hire top talent for long-term projects and specialized tasks.",
                price: "1% Commission",
                icon: "🌐"
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all duration-200"
              >
                <span className="text-4xl mb-4 block">{service.icon}</span>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <p className="text-xl font-semibold text-blue-400 mb-6">{service.price}</p>
                <Link
                  to="/signup"
                  className="inline-block bg-gray-700 text-gray-100 px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-800 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Skill Hub?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Experience the future of freelancing with our innovative platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <span className="text-2xl">🌟</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Top Talent</h3>
                      <p className="text-gray-400">Access to verified professionals from around the world</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <span className="text-2xl">💼</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                      <p className="text-gray-400">Safe and reliable payment protection system</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                      <p className="text-gray-400">Dedicated support team ready to help</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-2xl opacity-20"></div>
                <img
                  src="/features-image.png"
                  alt="Features"
                  className="relative z-10 rounded-xl border border-gray-700 w-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 27C8.373 27 3 21.627 3 15S8.373 3 15 3s12 5.373 12 12-5.373 12-12 12z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 animate-fade-in">
            Ready to start your <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">journey?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium overflow-hidden bg-white hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 text-blue-600 font-semibold flex items-center">
                Join Skill Hub Today
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-white to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

import React from 'react';
import { Shield } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#d4633f]" />
            </div>
            <h1 className="text-4xl text-[#f5f5f5]">Privacy Policy</h1>
          </div>

          <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 md:p-12 space-y-6 text-[#999999]">
            <p className="text-sm text-[#999999]">Last updated: February 12, 2026</p>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Introduction</h2>
              <p>
                Resistance Radio is committed to protecting your privacy and ensuring the security of your personal
                information. This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>Contact information (name, email, phone number)</li>
                <li>Communication preferences</li>
                <li>Listening data and analytics</li>
                <li>Voluntary submissions (stories, comments, feedback)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>Provide and improve our broadcasting services</li>
                <li>Send you updates and newsletters (with your consent)</li>
                <li>Respond to your inquiries and feedback</li>
                <li>Analyze and improve our content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>Access your personal data</li>
                <li>Request correction or deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@resistanceradiostation.org" className="text-[#d4633f] hover:text-[#d4af37]">
                  privacy@resistanceradiostation.org
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
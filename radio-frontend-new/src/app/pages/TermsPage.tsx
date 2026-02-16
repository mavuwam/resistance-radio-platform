import React from 'react';
import { FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#d4633f]" />
            </div>
            <h1 className="text-4xl text-[#f5f5f5]">Terms of Use</h1>
          </div>

          <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 md:p-12 space-y-6 text-[#999999]">
            <p className="text-sm text-[#999999]">Last updated: February 12, 2026</p>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Acceptance of Terms</h2>
              <p>
                By accessing and using Resistance Radio's services, you agree to be bound by these Terms of Use and
                all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Use of Service</h2>
              <p>You agree to use our services only for lawful purposes and in a way that does not infringe upon the rights of others.</p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Content Submissions</h2>
              <p>
                By submitting content to Resistance Radio, you grant us a non-exclusive license to use, reproduce,
                and distribute your content in connection with our broadcasting services.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Intellectual Property</h2>
              <p>
                All content on this platform, including broadcasts, articles, and designs, is owned by Resistance
                Radio or its content suppliers and is protected by copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Disclaimers</h2>
              <p>
                Our services are provided "as is" without warranties of any kind, either express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Contact</h2>
              <p>
                For questions about these Terms, contact us at{' '}
                <a href="mailto:legal@resistanceradiostation.org" className="text-[#d4633f] hover:text-[#d4af37]">
                  legal@resistanceradiostation.org
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
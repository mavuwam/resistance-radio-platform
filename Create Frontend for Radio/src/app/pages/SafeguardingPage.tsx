import React from 'react';
import { Shield } from 'lucide-react';

export function SafeguardingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#d4633f]/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#d4633f]" />
            </div>
            <h1 className="text-4xl text-[#f5f5f5]">Safeguarding Statement</h1>
          </div>

          <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 md:p-12 space-y-6 text-[#999999]">
            <p>
              Resistance Radio is committed to safeguarding all individuals who engage with our services, particularly
              children and vulnerable adults.
            </p>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Our Commitment</h2>
              <p>We are committed to:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>Creating a safe environment for all community members</li>
                <li>Protecting children and vulnerable adults from harm</li>
                <li>Responding promptly and appropriately to safeguarding concerns</li>
                <li>Training our staff and volunteers in safeguarding practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Reporting Concerns</h2>
              <p>
                If you have safeguarding concerns, please contact our safeguarding officer immediately at{' '}
                <a href="mailto:safeguarding@resistanceradiostation.org" className="text-[#d4633f] hover:text-[#d4af37]">
                  safeguarding@resistanceradiostation.org
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Code of Conduct</h2>
              <p>
                All staff, volunteers, and contributors must adhere to our Code of Conduct, which includes guidelines
                for appropriate behavior and interaction with community members.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Vulnerable Contributors</h2>
              <p>
                We take special care when working with vulnerable individuals, ensuring informed consent, appropriate
                support, and protection of their wellbeing.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Heart } from 'lucide-react';

export function EthicalPrinciplesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#d4af37]" />
            </div>
            <h1 className="text-4xl text-[#f5f5f5]">Ethical Broadcasting Principles</h1>
          </div>

          <div className="bg-[#1a1a1a] border border-[#f5f5f5]/10 rounded-xl p-8 md:p-12 space-y-6 text-[#999999]">
            <p>
              Resistance Radio is committed to the highest standards of ethical journalism and broadcasting. These
              principles guide all our work.
            </p>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Truth and Accuracy</h2>
              <p>
                We are committed to reporting the truth. We verify information before broadcasting and correct errors
                promptly and transparently.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Independence</h2>
              <p>
                We maintain editorial independence from commercial and political interests. Our loyalty is to our
                listeners and the truth.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Fairness and Balance</h2>
              <p>
                We strive to present diverse perspectives and give fair representation to all sides of a story,
                particularly marginalized voices.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Accountability</h2>
              <p>
                We are accountable to our audience and community. We welcome feedback and take responsibility for our
                content.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Respect for Privacy and Dignity</h2>
              <p>
                We respect the privacy and dignity of all individuals, particularly those who are vulnerable or have
                experienced trauma.
              </p>
            </section>

            <section>
              <h2 className="text-[#f5f5f5] mb-3">Community Service</h2>
              <p>
                We serve the public interest by amplifying voices that challenge injustice and promote social
                transformation.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

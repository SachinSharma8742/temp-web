import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CollapsiblePolicy = ({ title, children, defaultExpanded = true }) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className="border-b border-[var(--text-body)]/5 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group transition-all duration-300"
      >
        <h3 className="text-xl font-medium text-[var(--text-heading)] tracking-wide group-hover:text-gold transition-colors duration-300">
          {title}
        </h3>
        <Motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-[var(--text-body)]/40 group-hover:text-gold"
        >
          <ChevronDown size={20} />
        </Motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pb-8 text-[var(--text-body)]/80 font-light leading-relaxed space-y-4">
              {children}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TermsAndConditions = () => {
  const navigate = useNavigate();
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen pt-32 pb-20 px-6 md:px-12 lg:px-24 bg-[var(--bg-base)] text-[var(--text-body)]"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="group inline-flex items-center gap-3 mb-12 text-sm uppercase tracking-[0.2em] text-[var(--text-body)]/60 hover:text-gold transition-colors duration-300"
        >
          <div className="w-10 h-10 rounded-full border border-[var(--text-body)]/10 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-16">
          <Motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-[var(--text-heading)]"
          >
            Terms & <span className="text-gold italic font-serif opacity-90">Conditions</span>
          </Motion.h1>
          <div className="w-20 h-px bg-gold/50 mb-8" />
          <p className="text-lg text-[var(--text-body)]/60 font-light max-w-2xl leading-relaxed">
            At <span className="text-[var(--text-heading)] font-medium">Take a Break</span>, we understand that plans can change. Our policies are designed to be as fair and transparent as possible.
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_rgba(15,23,42,0.03)] border border-[var(--text-body)]/5">
          
          <CollapsiblePolicy title="Cancellation by the Customer">
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--bg-base)]/50 border border-[var(--text-body)]/5">
                <p className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">Refund Schedule</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-[var(--text-body)]/5">
                    <span className="text-sm">More than 30 days</span>
                    <span className="font-medium text-[var(--text-heading)]">100% Refund</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-[var(--text-body)]/5">
                    <span className="text-sm">15 to 30 days</span>
                    <span className="font-medium text-[var(--text-heading)]">75% Refund*</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-[var(--text-body)]/5">
                    <span className="text-sm">7 to 14 days</span>
                    <span className="font-medium text-[var(--text-heading)]">25% Refund</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-[var(--text-body)]/5">
                    <span className="text-sm">Less than 7 days</span>
                    <span className="font-medium text-red-500/80">No Refund</span>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-widest opacity-40 mt-3">* 75% refund + Credit note for remaining 25%</p>
              </div>
            </div>
          </CollapsiblePolicy>

          <CollapsiblePolicy title="Cancellation by Take a Break">
            <p>
              In the rare event that we need to cancel a tour due to unforeseen circumstances (e.g., natural disasters, political instability), you will have the option to:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 opacity-80">
              <li>Receive a full refund.</li>
              <li>Reschedule the tour to another available date at no extra cost.</li>
              <li>Receive a credit voucher for the full amount, valid for future tours.</li>
            </ul>
          </CollapsiblePolicy>

          <CollapsiblePolicy title="Operational Policies">
            <div className="space-y-6">
              <div>
                <h4 className="text-[var(--text-heading)] font-medium mb-2 uppercase text-xs tracking-widest opacity-80">Partial Cancellations</h4>
                <p className="opacity-80">If only a part of the group cancels, the refund will be based on the number of travelers and the revised pricing for the remaining participants.</p>
              </div>
              <div className="pt-4 border-t border-[var(--text-body)]/5">
                <h4 className="text-[var(--text-heading)] font-medium mb-2 uppercase text-xs tracking-widest opacity-80">Force Majeure</h4>
                <p className="opacity-80">In situations beyond our control (such as pandemics, acts of God, etc.), refunds or rescheduling will be handled on a case-by-case basis.</p>
              </div>
              <div className="pt-4 border-t border-[var(--text-body)]/5">
                <h4 className="text-[var(--text-heading)] font-medium mb-2 uppercase text-xs tracking-widest opacity-80">No-Show Policy</h4>
                <p className="opacity-80">If you fail to join the tour without prior notice, no refund will be provided.</p>
              </div>
            </div>
          </CollapsiblePolicy>

          <CollapsiblePolicy title="Important Notes">
            <ul className="list-disc pl-5 space-y-3 opacity-90">
              <li>All cancellation requests must be made in writing via <span className="text-gold font-serif italic">email</span>.</li>
              <li>Refunds will be processed within <span className="font-medium">7-10 business days</span> after the cancellation has been confirmed.</li>
              <li>Certain special offers and promotional packages may have different cancellation terms. Please refer to the specific terms provided at the time of booking.</li>
            </ul>
          </CollapsiblePolicy>

          <CollapsiblePolicy title="Privacy Policy">
            <div className="space-y-6">
              <p>
                In this policy, the terms <span className="font-medium text-[var(--text-heading)]">"We," "Us," "Our,"</span> and
                <span className="font-medium text-[var(--text-heading)]"> "Company"</span> refer to
                <span className="font-medium text-[var(--text-heading)]"> Take a Break</span>. The terms
                <span className="font-medium text-[var(--text-heading)]"> "You," "Your,"</span> and
                <span className="font-medium text-[var(--text-heading)]"> "Yourself"</span> refer to users of our website.
              </p>

              <p>
                This Privacy Policy is an electronic record and forms an electronic contract under the Information Technology Act, 2000,
                read with applicable rules and amendments relating to electronic records and documents. No physical, electronic,
                or digital signature is required for this policy.
              </p>

              <p>
                This policy is a legally binding agreement between you and Take a Break. By accessing or using
                <span className="font-medium text-[var(--text-heading)]"> www.takeabreak.org.in</span>, you agree to this policy.
                It is published in accordance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive
                Personal Data or Information) Rules, 2011, and explains how we collect, use, store, and transfer personal information.
                If you do not agree with this policy, please discontinue use of the website. By submitting your information or using
                our services, you consent to collection, storage, processing, and sharing of your personal data as described below.
              </p>

              <div className="pt-4 border-t border-[var(--text-body)]/5 space-y-3">
                <h4 className="text-[var(--text-heading)] font-medium uppercase text-xs tracking-widest opacity-80">1. User Information</h4>
                <p className="opacity-85">
                  To use certain services, you may be asked to provide information during registration, including personal and profile details.
                </p>
                <ul className="list-disc pl-5 space-y-2 opacity-85">
                  <li><span className="font-medium">Personal details:</span> name, email address, gender, age, PIN code, and occupation.</li>
                  <li><span className="font-medium">Additional details:</span> interests, preferences, and passwords.</li>
                </ul>
                <p className="opacity-85">
                  This information helps us improve our services, personalize your experience, and maintain a user-friendly platform.
                  We only collect and process data that is reasonably required for service delivery and experience enhancement.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--text-body)]/5 space-y-3">
                <h4 className="text-[var(--text-heading)] font-medium uppercase text-xs tracking-widest opacity-80">2. Cookies</h4>
                <p className="opacity-85">
                  We may use cookies and similar technologies to improve responsiveness and overall user experience.
                  Cookies are small files stored on your device that help identify unique visitors and monitor activity.
                  Unless you voluntarily submit identifiable information, cookie data is generally anonymous.
                </p>
                <p className="opacity-85">
                  Our servers may also capture limited technical information, including your IP address, to analyze website traffic
                  and improve performance. Your IP address is not treated as personally identifiable information by itself.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--text-body)]/5 space-y-3">
                <h4 className="text-[var(--text-heading)] font-medium uppercase text-xs tracking-widest opacity-80">3. Links to Other Sites</h4>
                <p className="opacity-85">
                  Our website may include links to third-party websites. This Privacy Policy applies only to our own website.
                  We are not responsible for the privacy practices of external websites, and we encourage you to review their
                  privacy policies before sharing any personal data.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--text-body)]/5 space-y-3">
                <h4 className="text-[var(--text-heading)] font-medium uppercase text-xs tracking-widest opacity-80">4. Information Sharing</h4>
                <p className="opacity-85">
                  We do not disclose sensitive personal information to third parties without your consent, except in specific situations:
                </p>
                <ul className="list-disc pl-5 space-y-2 opacity-85">
                  <li><span className="font-medium">Legal compliance:</span> where required by law, court order, or government authority for verification, investigation, or legal proceedings.</li>
                  <li><span className="font-medium">Group entities and trusted processors:</span> with affiliated companies or service partners processing data on our behalf, subject to confidentiality and security obligations consistent with this policy.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--text-body)]/5 space-y-3">
                <h4 className="text-[var(--text-heading)] font-medium uppercase text-xs tracking-widest opacity-80">5. Information Security</h4>
                <p className="opacity-85">
                  We maintain reasonable and robust safeguards to protect your personal data from unauthorized access,
                  modification, misuse, or destruction. These practices include:
                </p>
                <ul className="list-disc pl-5 space-y-2 opacity-85">
                  <li>Periodic internal reviews of storage and processing systems.</li>
                  <li>Secure infrastructure protected by firewalls and access controls.</li>
                  <li>Encryption of sensitive data during internet transmission.</li>
                </ul>
                <p className="opacity-85">
                  While we follow industry-standard safeguards, no system can guarantee absolute security.
                  Accordingly, we cannot warrant complete security in all circumstances. Any data we collect
                  will always be handled according to the policy applicable at the time of collection.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--text-body)]/5 space-y-3">
                <h4 className="text-[var(--text-heading)] font-medium uppercase text-xs tracking-widest opacity-80">6. Changes to this Privacy Policy</h4>
                <p className="opacity-85">
                  As technology and legal requirements evolve, we may revise this Privacy Policy from time to time.
                  Any updates will be posted on this page with a revised effective date. You are advised to review
                  this page periodically to stay informed.
                </p>
              </div>
            </div>
          </CollapsiblePolicy>

        </div>

        {/* High-Impact CTA Section */}
        <Motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 md:p-12 rounded-[2.5rem] bg-[var(--text-heading)] text-white relative overflow-hidden shadow-2xl"
        >
          {/* Decorative radial glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-md">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Need more clarity?</h2>
              <p className="text-white/70 text-lg font-light leading-relaxed">
                If you have any questions regarding our policies or want to discuss a custom requirement, our specialists are here to help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  navigate('/#contact');
                }}
                className="px-8 py-4 rounded-full bg-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-lg"
              >
                Post an Enquiry
              </button>
            </div>
          </div>
        </Motion.div>

        {/* Footer info */}
        <div className="mt-16 pt-12 border-t border-[var(--text-body)]/5 text-xs uppercase tracking-widest text-[var(--text-body)]/30 flex justify-between items-center">
          <div className="flex gap-4">
            <span>Design Your India</span>
            <span className="opacity-30">|</span>
            <span>Take a Break</span>
          </div>
          <span>Last Updated: April 2026</span>
        </div>
      </div>
    </Motion.section>
  );
};

export default TermsAndConditions;

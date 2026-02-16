import React, { useState } from 'react';
import SEO from '../components/SEO';
import './ContactPage.css';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitError('Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim()) {
      setSubmitError('Please enter a subject');
      return false;
    }
    if (!formData.message.trim()) {
      setSubmitError('Please enter a message');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // API call would go here
      // await submitContactForm(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError('Failed to send message. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <SEO
        title="Contact Us"
        description="Get in touch with Resistance Radio. Whether you have a question, story idea, or partnership inquiry, we'd love to hear from you."
        keywords={['contact', 'get in touch', 'press inquiries', 'partnerships']}
        url="/contact"
      />
      <div className="container">
        <h1>Contact Us</h1>
        <p className="intro">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        
        <div className="contact-layout">
          <section className="contact-form-section">
            <h2>Send Us a Message</h2>
            
            {submitSuccess ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for contacting us. We'll get back to you within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Enquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="technical">Technical Issue</option>
                    <option value="content">Content Suggestion</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="press">Press/Media Enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                  />
                </div>

                {submitError && (
                  <div className="error-message">{submitError}</div>
                )}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </section>

          <aside className="contact-sidebar">
            <div className="info-card">
              <h3>Press & Media</h3>
              <p>For media enquiries, interview requests, and press releases</p>
              <p className="contact-detail">📧 press@resistanceradio.org</p>
            </div>
            
            <div className="info-card">
              <h3>Partnerships</h3>
              <p>For collaboration opportunities and partnership enquiries</p>
              <p className="contact-detail">📧 partnerships@resistanceradio.org</p>
            </div>
            
            <div className="info-card">
              <h3>General Enquiries</h3>
              <p>For all other questions and feedback</p>
              <p className="contact-detail">📧 info@resistanceradio.org</p>
            </div>

            <div className="info-card">
              <h3>WhatsApp</h3>
              <p>Contact us via WhatsApp</p>
              <p className="contact-detail">
                <a href="https://wa.me/447921462583" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                  💬 +44 7921 462583
                </a>
              </p>
            </div>

            <div className="info-card social-card">
              <h3>Follow Us</h3>
              <p>Stay connected on social media</p>
              <div className="social-links">
                <a href="https://twitter.com/resistanceradio" target="_blank" rel="noopener noreferrer" className="social-link">
                  Twitter
                </a>
                <a href="https://facebook.com/resistanceradio" target="_blank" rel="noopener noreferrer" className="social-link">
                  Facebook
                </a>
                <a href="https://instagram.com/resistanceradio" target="_blank" rel="noopener noreferrer" className="social-link">
                  Instagram
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

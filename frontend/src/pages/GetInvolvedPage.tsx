import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import './GetInvolvedPage.css';

type FormType = 'none' | 'story' | 'volunteer' | 'contributor';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  // Story specific
  storyType?: string;
  // Volunteer specific
  skills?: string;
  availability?: string;
  // Contributor specific
  contributionType?: string;
  experience?: string;
}

const GetInvolvedPage: React.FC = () => {
  const location = useLocation();
  const [activeForm, setActiveForm] = useState<FormType>('none');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle hash navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '') as FormType;
    if (hash === 'story' || hash === 'volunteer' || hash === 'contributor') {
      setActiveForm(hash);
      // Scroll to top when opening modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

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
      // await submitForm(activeForm, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveForm('none');
      }, 3000);
    } catch (error) {
      setSubmitError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeForm = () => {
    setActiveForm('none');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    setSubmitError('');
    setSubmitSuccess(false);
  };

  return (
    <div className="get-involved-page">
      <SEO
        title="Get Involved"
        description="Join the Resistance Radio community. Share your story, volunteer your skills, or pitch a show idea. Together, we amplify truth and courage."
        keywords={['get involved', 'volunteer', 'share story', 'contribute', 'community']}
        url="/get-involved"
      />
      <div className="container">
        <h1>Get Involved</h1>
        <p className="intro">
          Your voice matters. Join us in building a more just and informed society.
        </p>
        
        <section className="involvement-options">
          <div className="option-card">
            <h2>Submit a Story</h2>
            <p>Share your lived experience, testimony, or civic insight.</p>
            <p>We want to hear from you:</p>
            <ul>
              <li>Personal experiences with governance</li>
              <li>Community issues that need attention</li>
              <li>Testimonies of injustice or resilience</li>
              <li>Questions for those in power</li>
            </ul>
            <button className="btn btn-primary" onClick={() => setActiveForm('story')}>
              Submit Your Story
            </button>
          </div>
          
          <div className="option-card">
            <h2>Volunteer</h2>
            <p>Join our research, production, or community engagement teams.</p>
            <ul>
              <li>Research and fact-checking</li>
              <li>Production and technical support</li>
              <li>Community outreach</li>
              <li>Event coordination</li>
            </ul>
            <button className="btn btn-primary" onClick={() => setActiveForm('volunteer')}>
              Apply to Volunteer
            </button>
          </div>
          
          <div className="option-card">
            <h2>Become a Contributor</h2>
            <p>Pitch a show, write an article, or host a segment.</p>
            <p>We're looking for:</p>
            <ul>
              <li>Show hosts and co-hosts</li>
              <li>Writers and researchers</li>
              <li>Subject matter experts</li>
              <li>Community voices</li>
            </ul>
            <button className="btn btn-primary" onClick={() => setActiveForm('contributor')}>
              Pitch Your Idea
            </button>
          </div>
          
          <div className="option-card">
            <h2>Support the Station</h2>
            <p>Help us continue amplifying citizen voices.</p>
            <p>Your support enables us to:</p>
            <ul>
              <li>Maintain independent broadcasting</li>
              <li>Expand our programming</li>
              <li>Reach more communities</li>
              <li>Invest in quality content</li>
            </ul>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </section>
      </div>

      {activeForm !== 'none' && (
        <div className="form-modal-overlay" onClick={closeForm}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeForm}>×</button>
            
            <div className="modal-header">
              <h2>
                {activeForm === 'story' && 'Submit Your Story'}
                {activeForm === 'volunteer' && 'Volunteer Application'}
                {activeForm === 'contributor' && 'Contributor Pitch'}
              </h2>
              <p>
                {activeForm === 'story' && 'Share your experience or insight with our community'}
                {activeForm === 'volunteer' && 'Tell us about your skills and availability'}
                {activeForm === 'contributor' && 'Pitch your show idea or article topic'}
              </p>
            </div>

            {submitSuccess ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Thank you for your submission!</h3>
                <p>We'll review your {activeForm === 'story' ? 'story' : activeForm === 'volunteer' ? 'application' : 'pitch'} and get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="involvement-form">
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

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {activeForm === 'story' && (
                  <div className="form-group">
                    <label htmlFor="storyType">Story Type *</label>
                    <select
                      id="storyType"
                      name="storyType"
                      value={formData.storyType || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a type</option>
                      <option value="personal_experience">Personal Experience</option>
                      <option value="community_issue">Community Issue</option>
                      <option value="testimony">Testimony</option>
                      <option value="question">Question for Leaders</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                {activeForm === 'volunteer' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="skills">Skills & Experience</label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={formData.skills || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Research, Audio editing, Community organizing"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="availability">Availability</label>
                      <input
                        type="text"
                        id="availability"
                        name="availability"
                        value={formData.availability || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Weekends, 10 hours/week"
                      />
                    </div>
                  </>
                )}

                {activeForm === 'contributor' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="contributionType">Contribution Type *</label>
                      <select
                        id="contributionType"
                        name="contributionType"
                        value={formData.contributionType || ''}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a type</option>
                        <option value="show_host">Show Host</option>
                        <option value="writer">Writer</option>
                        <option value="researcher">Researcher</option>
                        <option value="expert">Subject Matter Expert</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="experience">Relevant Experience</label>
                      <textarea
                        id="experience"
                        name="experience"
                        value={formData.experience || ''}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Tell us about your background and expertise"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label htmlFor="message">
                    {activeForm === 'story' && 'Your Story *'}
                    {activeForm === 'volunteer' && 'Why do you want to volunteer? *'}
                    {activeForm === 'contributor' && 'Your Pitch *'}
                  </label>
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

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetInvolvedPage;

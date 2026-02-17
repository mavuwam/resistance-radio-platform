import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import SEO from '../components/SEO';
import './EventsPage.css';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  status: string;
  registration_url?: string;
  image_url?: string;
}

const EventsPage: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'live_space', label: 'Live Spaces' },
    { value: 'community_dialogue', label: 'Community Dialogues' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'public_campaign', label: 'Public Campaigns' },
    { value: 'town_hall', label: 'Town Halls' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [upcoming, past] = await Promise.all([
        getEvents({ status: 'upcoming', limit: 20 }),
        getEvents({ status: 'past', limit: 20 })
      ]);
      setUpcomingEvents(Array.isArray(upcoming) ? upcoming : []);
      setPastEvents(Array.isArray(past) ? past : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setUpcomingEvents([]);
      setPastEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (events: Event[]) => {
    if (selectedType === 'all') return events;
    return events.filter(event => event.event_type === selectedType);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openEventModal = (event: Event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const filteredUpcoming = filterEvents(upcomingEvents);
  const filteredPast = filterEvents(pastEvents);

  return (
    <div className="events-page">
      <SEO
        title="Events"
        description="Join us for community gatherings, workshops, and civic dialogues. Discover upcoming events and past highlights from Resistance Radio."
        keywords={['events', 'community events', 'workshops', 'civic dialogue', 'zimbabwe events']}
        url="/events"
      />
      <div className="container">
        <h1>Events & Community</h1>
        <p className="intro">
          Join us for live conversations, workshops, and community gatherings that strengthen civic engagement.
        </p>
        
        <div className="event-type-filter">
          {eventTypes.map((type) => (
            <button
              key={type.value}
              className={`filter-btn ${selectedType === type.value ? 'active' : ''}`}
              onClick={() => setSelectedType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <>
            <section className="upcoming-events">
              <h2>Upcoming Events</h2>
              
              {filteredUpcoming.length === 0 ? (
                <div className="no-events">
                  {selectedType !== 'all' 
                    ? 'No upcoming events in this category.' 
                    : 'No upcoming events scheduled yet.'}
                </div>
              ) : (
                <div className="events-grid">
                  {filteredUpcoming.map((event) => (
                    <div 
                      key={event.id} 
                      className="event-card upcoming"
                      onClick={() => openEventModal(event)}
                    >
                      {event.image_url && (
                        <div className="event-image">
                          <img src={event.image_url} alt={event.title} />
                        </div>
                      )}
                      <div className="event-content">
                        <div className="event-header">
                          <span className="event-type-badge">
                            {eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}
                          </span>
                          <span className="event-date-badge">{formatShortDate(event.event_date)}</span>
                        </div>
                        <h3>{event.title}</h3>
                        <p className="event-description">{event.description}</p>
                        <div className="event-footer">
                          <span className="event-location">📍 {event.location}</span>
                          {event.registration_url && (
                            <span className="register-indicator">Register →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section className="past-events">
              <h2>Past Events Archive</h2>
              <p className="section-intro">Browse recordings and summaries of past community events</p>
              
              {filteredPast.length === 0 ? (
                <div className="no-events">
                  {selectedType !== 'all' 
                    ? 'No past events in this category.' 
                    : 'No past events available yet.'}
                </div>
              ) : (
                <div className="archive-list">
                  {filteredPast.map((event) => (
                    <div 
                      key={event.id} 
                      className="archive-item"
                      onClick={() => openEventModal(event)}
                    >
                      <div className="archive-date">
                        <span className="month">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="day">{new Date(event.event_date).getDate()}</span>
                      </div>
                      <div className="archive-content">
                        <span className="event-type-badge">
                          {eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}
                        </span>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <span className="event-location">📍 {event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedEvent && (
        <div className="event-modal-overlay" onClick={closeEventModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEventModal}>×</button>
            
            {selectedEvent.image_url && (
              <div className="modal-image">
                <img src={selectedEvent.image_url} alt={selectedEvent.title} />
              </div>
            )}
            
            <div className="modal-content">
              <span className="event-type-badge">
                {eventTypes.find(t => t.value === selectedEvent.event_type)?.label || selectedEvent.event_type}
              </span>
              <h2>{selectedEvent.title}</h2>
              <div className="modal-meta">
                <div className="meta-item">
                  <strong>Date & Time:</strong>
                  <span>{formatDate(selectedEvent.event_date)}</span>
                </div>
                <div className="meta-item">
                  <strong>Location:</strong>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="meta-item">
                  <strong>Status:</strong>
                  <span className={`status-badge ${selectedEvent.status}`}>
                    {selectedEvent.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                  </span>
                </div>
              </div>
              <p className="modal-description">{selectedEvent.description}</p>
              
              {selectedEvent.registration_url && selectedEvent.status === 'upcoming' && (
                <a 
                  href={selectedEvent.registration_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Register for Event
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;

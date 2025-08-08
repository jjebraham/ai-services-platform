import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { llmServices } from './llmData';

function LLMSlideshow() {
  const { t, lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(2);
  
  // Calculate slides to show based on window width and update on resize
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(window.innerWidth >= 768 ? 2 : 1);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const totalSlides = Math.ceil(llmServices.length / slidesToShow);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const getCurrentSlideServices = () => {
    const startIndex = currentIndex * slidesToShow;
    return llmServices.slice(startIndex, startIndex + slidesToShow);
  };

  // Default logos for each LLM with absolute paths
  const logoImages = {
    'chatgpt-plus': '/chatgpt-logo.svg',
    'claude-pro': '/claude-logo.svg',
    'gemini-advanced': '/gemini-logo.svg',
    'perplexity-pro': '/perplexity-logo.svg',
    'supergrok': '/supergrok-logo.svg'
  };

  return (
    <div className="llm-slideshow">
      <div className="slideshow-container">
        <div className="slides-wrapper">
          <div 
            className="slides-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="slide">
                <div className="slide-content">
                  {llmServices
                    .slice(slideIndex * slidesToShow, (slideIndex + 1) * slidesToShow)
                    .map((service) => (
                      <div key={service.id} className="llm-card">
                        <Link to={`/llms/${service.id}`} className="llm-card-link">
                          <div className="llm-logo">
                            {/* Use logo image with fallback to logo placeholder */}
                            {logoImages[service.id] ? (
                              <img 
                                src={logoImages[service.id]} 
                                alt={`${service.name[lang]} logo`}
                                className="logo-image"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = `<div class="logo-placeholder">${service.icon}</div>`;
                                }}
                              />
                            ) : (
                              <div className="logo-placeholder">{service.icon}</div>
                            )}
                          </div>
                          <div className="llm-info">
                            <h3 className="llm-name">{service.name[lang]}</h3>
                            <p className="llm-description">{service.intro[lang]}</p>
                          </div>
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          className="nav-arrow nav-arrow-left"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="nav-arrow nav-arrow-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LLMSlideshow;
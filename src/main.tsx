import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'


// Function to update meta tags dynamically
function updateMetaTags(page: 'home' | 'rankings' = 'home') {
  const baseTitle = "Vespertine's City Crawler - An Interactive Map for RavenBlack City";
  const baseDescription = 'Track and report shop locations, guilds, hunters, and more in RavenBlack City. Interactive map with real-time location updates and leaderboard rankings.';

  let title = baseTitle;
  let description = baseDescription;

  if (page === 'rankings') {
    title = 'Rankings - Vespertine\'s City Crawler';
    description = 'View leaderboards for Top Reporters, Blood Deities, and Rich Vampires in RavenBlack City.';
  }

  // Update document title
  document.title = title;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }

  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }

  // Update Twitter tags
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title);
  }

  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', description);
  }
}

// Export the function for use in components
export { updateMetaTags };

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
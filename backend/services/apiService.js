// services/apiService.js
const axios = require('axios');

class SportsRadarAPI {
  constructor() {
    this.baseURL = 'https://api.sportradar.com/nfl/official/trial/v7/en';
    this.apiKey = 'ouq5rnvuViEjyGXMHLil0MHZRz7VuNjgMuGSIRI6'; // Move to .env later
  }

  async makeRequest(endpoint) {
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('SportsRadar API Error:', error.message);
      throw new Error('Failed to fetch data from SportsRadar API');
    }
  }

  // Get player by SportsRadar ID
  async getPlayerById(playerId) {
    return await this.makeRequest(`players/${playerId}/profile.json`);
  }

  // We'll need to find the search endpoint - let me check if you have it
  async searchPlayers(name) {
    // This endpoint might be different - do you have a search endpoint?
    // If not, we'll need to work with what we have
    console.log('Need search endpoint for:', name);
    return null;
  }
}

module.exports = new SportsRadarAPI();
// services/apiService.js
// services/apiService.js
const axios = require('axios');
require('dotenv').config();

class SportsRadarAPI {
  constructor() {
    this.baseURL = 'https://api.sportradar.com/nfl/official/trial/v7/en';
    this.apiKey = 'ouq5rnvuViEjyGXMHLil0MHZRz7VuNjgMuGSIRI6';
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

  // 👇 GET ALL TEAMS
  async getAllTeams() {
    return await this.makeRequest('league/teams.json');
  }

  // 👇 GET SPECIFIC TEAM ROSTER
  async getTeamRoster(teamId) {
    return await this.makeRequest(`teams/${teamId}/full_roster.json`);
  }

  // 👇 GET PLAYER PROFILE (existing)
  async getPlayerById(playerId) {
    return await this.makeRequest(`players/${playerId}/profile.json`);
  }
}

module.exports = new SportsRadarAPI();
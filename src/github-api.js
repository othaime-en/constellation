const axios = require('axios');

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

async function fetchGitHubContributions(username, year, token) {
    let fromDate, toDate;

    if (year === 'last-year') {
        const now = new Date();
        toDate = now.toISOString();
        const past = new Date(now);
        past.setFullYear(now.getFullYear() - 1);
        fromDate = past.toISOString();
    } else {
        fromDate = `${year}-01-01T00:00:00Z`;
        toDate = `${year}-12-31T23:59:59Z`;
    }

    const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

}

module.exports = { fetchGitHubContributions };
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

    try {
        const response = await axios.post(
            GITHUB_GRAPHQL_ENDPOINT,
            {
                query,
                variables: { username, from: fromDate, to: toDate }
            },
            { headers }
        );

        if (response.data.errors) {
            if (response.data.errors[0].type === 'NOT_FOUND') {
                throw new Error('User not found');
            }
            throw new Error(response.data.errors[0].message);
        }

        if (!response.data.data.user) {
            throw new Error('User not found');
        }

        const calendar = response.data.data.user.contributionsCollection.contributionCalendar;

        // Flatten the weeks into a single array of contributions
        const contributions = calendar.weeks.flatMap(week =>
            week.contributionDays.map(day => ({
                date: day.date,
                count: day.contributionCount
            }))
        );

        return {
            totalContributions: calendar.totalContributions,
            contributions
        };

    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Invalid GitHub token');
        }
        if (error.response?.status === 403) {
            throw new Error('GitHub API rate limit exceeded');
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Network error - cannot reach GitHub API');
        }
        throw error;
    }
}

module.exports = { fetchGitHubContributions };
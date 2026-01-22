const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
const { fetchGitHubContributions } = require('./src/github-api');
const { calculateStarPositions } = require('./src/positioning');
const { renderSVG } = require('./src/renderer');
const { getCache, setCache } = require('./src/cache');

const program = new Command();

program
    .name('github-constellation')
    .description('Generate a cosmic constellation from your GitHub contributions')
    .version('1.0.0')
    .argument('<username>', 'GitHub username')
    .option('-o, --output <path>', 'Output file path')
    .option('-y, --year <year>', 'Year to generate (default: last-year)', 'last-year')
    .option('-w, --width <width>', 'Canvas width in pixels', '1100')
    .option('-h, --height <height>', 'Canvas height in pixels', '180')
    .option('-v, --verbose', 'Show detailed progress', false)
    .option('--no-cache', 'Skip cache and fetch fresh data', false)
    .option('--markdown', 'Generate markdown snippet for README', false)
    .option('-t, --token <token>', 'GitHub personal access token (optional, for higher rate limits)')
    .action(async (username, options) => {
        const spinner = options.verbose ? ora() : null;

        try {
            // Step 1: Fetch contribution data
            if (spinner) spinner.start('Fetching GitHub contribution data...');

            const cacheKey = `${username}-${options.year}`;
            let contributionData;

            if (options.cache) {
                contributionData = await getCache(cacheKey);
                if (contributionData && spinner) {
                    spinner.succeed('Using cached contribution data');
                }
            }

            if (!contributionData) {
                contributionData = await fetchGitHubContributions(username, options.year, options.token);
                await setCache(cacheKey, contributionData);
                if (spinner) spinner.succeed(`Fetched ${contributionData.totalContributions} contributions`);
            }

            // Step 2: Calculate star positions
            if (spinner) spinner.start('Calculating star positions...');
            const stars = calculateStarPositions(
                contributionData.contributions,
                parseInt(options.width),
                parseInt(options.height)
            );
            if (spinner) spinner.succeed(`Positioned ${stars.length} stars`);

            // Step 3: Render SVG
            if (spinner) spinner.start('Rendering constellation...');
            const svg = renderSVG(stars, parseInt(options.width), parseInt(options.height), {
                username,
                year: options.year,
                totalContributions: contributionData.totalContributions
            });
            if (spinner) spinner.start('Saving constellation...');

            // Step 4: Save to file
            let outputPath = options.output || `${username}-constellation.svg`;
            outputPath = outputPath.replace('(username)', username);
            await fs.writeFile(outputPath, svg);
            if (spinner) spinner.succeed(`Constellation saved to ${chalk.cyan(outputPath)}`);

            console.log(chalk.green('✨ Your GitHub constellation is ready!'));

            // Step 5: Generate markdown if requested
            if (options.markdown) {
                const markdown = `![${username}'s GitHub Constellation](./${path.basename(outputPath)})`;
                console.log('\n' + chalk.blue('📋 Markdown snippet for your README:'));
                console.log(chalk.gray('─'.repeat(50)));
                console.log(markdown);
                console.log(chalk.gray('─'.repeat(50)));
            }

        } catch (error) {
            if (spinner) spinner.fail('Failed to generate constellation');

            if (error.message.includes('User not found')) {
                console.error(chalk.red(`❌ GitHub user "${username}" not found`));
            } else if (error.message.includes('rate limit')) {
                console.error(chalk.red('❌ GitHub API rate limit exceeded'));
                console.error(chalk.yellow('💡 Tip: Provide a GitHub token with --token flag for higher limits'));
            } else if (error.message.includes('network')) {
                console.error(chalk.red('❌ Network error. Please check your internet connection'));
            } else {
                console.error(chalk.red('❌ Error:'), error.message);
                if (options.verbose) {
                    console.error(error.stack);
                }
            }

            process.exit(1);
        }
    });

program.parse();


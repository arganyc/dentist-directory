const { execSync } = require('child_process');
const opts = { cwd: process.cwd(), encoding: 'utf8' };
try {
  console.log('Adding files...');
  execSync('git add next.config.ts middleware.ts src/app/dentists/state', opts);
  console.log('Committing...');
  execSync('git commit -m "Add SEO-friendly state/city dentist routes with middleware and redirects"', opts);
  console.log('Pushing...');
  execSync('git push origin main', opts);
  console.log('DONE');
} catch (err) {
  console.error('ERROR');
  console.error(err.stdout || err.message);
  process.exit(1);
}

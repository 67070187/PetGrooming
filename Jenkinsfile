pipeline {
  agent any
  stages {
    stage('Backend tests') { steps { dir('backend') { sh 'npm ci || npm install'; sh 'npm test' } } }
    stage('Frontend build') { steps { dir('frontend') { sh 'npm ci || npm install'; sh 'npm run build' } } }
    stage('Docker build') { steps { sh 'docker compose build' } }
    stage('Deploy') { steps { sh 'docker compose up -d --wait' } }
    stage('Smoke test') { steps { sh 'curl -fsS http://localhost:3000/api/health'; sh 'curl -fsS http://localhost:3000/api/services' } }
  }
}

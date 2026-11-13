// PetGrooming CI/CD: test -> build -> deploy (Docker Compose) -> smoke test.
//
// Jenkins setup required once (Manage Jenkins):
//   Tools > NodeJS installations: add one named 'Node22' (Node.js 22, same as the Dockerfiles).
//   Credentials (kind "Secret text"):
//     petgrooming-postgres-password    database password
//     petgrooming-jwt-secret           long random JWT signing secret (32+ chars)
//     petgrooming-staff-password-hash  bcrypt hash for staff@petgrooming.com
// The agent needs docker, the docker compose plugin and curl.

pipeline {
  agent any

  tools {
    nodejs 'Node22'
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()   // two deploys must never race on the same stack
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  // Start automatically when new commits reach the branch on GitHub.
  // Polling (not a webhook) because the course Jenkins is not reachable from the internet;
  // with a public Jenkins URL, replace this with githubPush() and a GitHub webhook.
  triggers {
    pollSCM('H/2 * * * *')
  }

  environment {
    COMPOSE_PROJECT_NAME = 'petgrooming'   // stable name so each deploy replaces the previous stack
    BACKEND_PORT = '3000'
    FRONTEND_PORT = '5173'
    // SMOKE_HOST is not set here so a Jenkins-wide value wins (e.g. host.docker.internal when Jenkins
    // runs in a container); scripts/smoke-test.sh falls back to localhost.
  }

  stages {
    stage('Backend tests') {
      steps {
        dir('backend') {
          sh 'node --version && npm --version'
          sh 'npm ci'
          sh 'npm test'
        }
      }
    }

    stage('Frontend build') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Prepare .env') {
      steps {
        withCredentials([
          string(credentialsId: 'petgrooming-postgres-password', variable: 'PG_PASSWORD'),
          string(credentialsId: 'petgrooming-jwt-secret', variable: 'JWT'),
          string(credentialsId: 'petgrooming-staff-password-hash', variable: 'STAFF_HASH')
        ]) {
          // Single-quoted Groovy string: secrets are expanded by the shell, never interpolated into the
          // pipeline log. The bcrypt hash contains '$', so it is single-quoted for Docker Compose.
          sh '''
            umask 077
            {
              echo "POSTGRES_DB=petgrooming"
              echo "POSTGRES_USER=petgrooming"
              echo "POSTGRES_PASSWORD=${PG_PASSWORD}"
              echo "JWT_SECRET=${JWT}"
              echo "BACKEND_PORT=${BACKEND_PORT}"
              echo "FRONTEND_PORT=${FRONTEND_PORT}"
              echo "STAFF_PASSWORD_HASH='${STAFF_HASH}'"
            } > .env
            docker compose config --quiet
          '''
        }
      }
    }

    stage('Build images') {
      steps {
        // Docker Hub sometimes refuses connections; retry instead of failing the whole pipeline.
        retry(3) {
          sh 'docker compose build'
        }
      }
    }

    stage('Deploy') {
      steps {
        // Keeps the pgdata volume, so existing data survives redeploys.
        sh 'docker compose up -d --remove-orphans'
        sh 'docker compose ps'
      }
    }

    stage('Smoke test') {
      steps {
        sh 'sh scripts/smoke-test.sh'
      }
    }
  }

  post {
    failure {
      sh 'docker compose logs --no-color --tail=200 || true'
    }
    // cleanup runs after every other post block (failure needs .env for `docker compose logs`).
    cleanup {
      sh 'rm -f .env'                        // contains secrets; containers already have their env
      sh 'docker image prune -f || true'     // drop dangling layers left by rebuilds
    }
  }
}

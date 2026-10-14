
pipeline {
  agent any

  tools {
    nodejs 'Node24'
  }

  stages {
    stage('Backend tests') {
      steps {
        dir('backend') {
          sh 'node --version'
          sh 'npm --version'
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

    stage('Docker Build Backend') {
      steps {
        sh 'docker build -t petgrooming-backend:ci-${BUILD_NUMBER} ./backend'
      }
    }

    stage('Docker Build Frontend') {
      steps {
        sh 'docker build -t petgrooming-frontend:ci-${BUILD_NUMBER} ./frontend'
      }
    }

    stage('Docker Build Summary') {
      steps {
        sh 'docker images petgrooming-backend'
        sh 'docker images petgrooming-frontend'
      }
    }
  }
}

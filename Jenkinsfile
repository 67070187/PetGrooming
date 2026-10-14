
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
  }
}

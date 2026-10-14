
pipeline {
  agent {
    docker {
      image 'node:24-alpine'
      reuseNode true
    }
  }

  stages {
    stage('Backend tests') {
      steps {
        dir('backend') {
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

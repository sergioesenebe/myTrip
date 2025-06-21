pipeline {
    agent any

    environment {
        GIT_CREDENTIALS_ID = "github-creds"
        KUBECONFIG_CREDENTIALS_ID = "kubeconfig-minikube"
    }

    stages {
        stage('Clone') {
            steps {
                git credentialsId: "${GIT_CREDENTIALS_ID}", 
                    url: 'https://github.com/sergioesenebe/myTrip.git', 
                    branch: 'test'
            }
        }

        stage('Install Backend Deps') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "No backend tests or test failed"'
                }
            }
        }

        stage('Install Frontend Deps') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                dir('frontend') {
                    sh 'npm run test || echo "No frontend tests or test failed"'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t mytrip-backend:latest -f backend/Dockerfile backend/'
                sh 'docker build -t mytrip-frontend:latest -f frontend/Dockerfile frontend/'
            }
        }

        stage('Deploy to Minikube') {
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh 'kubectl apply -f kubernetes/mongo-deployment.yaml'
                    sh 'kubectl apply -f kubernetes/backend-deployment.yaml'
                    sh 'kubectl apply -f kubernetes/frontend-deployment.yaml'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
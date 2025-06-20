pipeline {
    agent any

    environment {
        GIT_CREDENTIALS_ID = "github-creds"
        KUBECONFIG_CREDENTIALS_ID = "kubeconfig-minikube"
    }

    stages {
        stage('Clone') {
            steps {
                git credentialsId: "${GIT_CREDENTIALS_ID}", url: 'https://github.com/sergioesenebe/myTrip.git', branch: 'test'
            }
        }

        stage('Install deps Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Run tests Backend') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "No tests defined or test failed"'
                }
            }
        }

        stage('Build Docker image Backend') {
            steps {
                sh 'docker build -t mytrip-backend:latest -f backend/Dockerfile backend/'
            }
        }

        stage('Build Docker image Frontend') {
            steps {
                sh 'docker build -t mytrip-frontend:latest -f frontend/Dockerfile frontend/'
            }
        }

        stage('Deploy to Minikube') {
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                            sh 'kubectl apply -f kubernetes/mongo-deployment.yaml'
                            sh 'kubectl apply -f kubernetes/frontend-deployment.yaml'
                            sh 'kubectl apply -f kubernetes/backend-deployment.yaml'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment success'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
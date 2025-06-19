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

        stage('Install deps') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                sh "docker build -t mytrip:latest ."
            }
        }

        stage('Deploy to Minikube') {
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh 'kubectl apply -f k8s/deployment.yaml'
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
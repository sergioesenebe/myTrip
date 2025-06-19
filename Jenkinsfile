pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "tusuario/tu-app"
        DOCKER_CREDENTIALS_ID = "dockerhub-creds"
        GIT_CREDENTIALS_ID = "github-creds"
        KUBECONFIG_CREDENTIALS_ID = "kubeconfig-minikube"
    }

    stages {
        stage('Clone') {
            steps {
                git credentialsId: "${GIT_CREDENTIALS_ID}", url: 'https://github.com/tuusuario/tu-repo.git', branch: 'main'
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
                script {
                    docker.withRegistry('', DOCKER_CREDENTIALS_ID) {
                        def image = docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                        image.push()
                        image.push('latest')
                    }
                }
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
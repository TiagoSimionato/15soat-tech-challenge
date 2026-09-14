resource "kubernetes_deployment" "app" {
  metadata {
    name      = "app-15soat-tech-challenge"
    namespace = var.namespace
    labels    = { app = "app-15soat-tech-challenge" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "app-15soat-tech-challenge" }
    }

    template {
      metadata {
        name   = "app-15soat-tech-challenge"
        labels = { app = "app-15soat-tech-challenge" }
      }

      spec {
        automount_service_account_token = false

        image_pull_secrets {
          name = "ghcr-secrets"
        }

        container {
          name  = "c-15soat-tech-challenge"
          image = var.image

          liveness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 10
          }

          resources {
            requests = {
              cpu               = "100m"
              memory            = "100Mi"
              ephemeral-storage = "2Gi"
            }
            limits = {
              cpu    = "200m"
              memory = "100Mi"
            }
          }

          port {
            container_port = 3000
          }

          env {
            name = "DB_NAME"
            value = var.postgres_db
          }

          env {
            name = "DB_USER"
            value = var.postgres_user
          }

          env {
            name = "DB_PASSWORD"
            value = var.postgres_password
          }

          env {
            name = "DB_HOST"
            value = var.db_host
          }

          env {
            name = "DB_PORT"
            value = var.db_port
          }

          env {
            name = "JWT_SECRET"
            value = var.jwt_secret
          }
        }
      }
    }
  }
}

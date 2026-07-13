resource "kubernetes_deployment" "db" {
  metadata {
    name      = "db-15soat-tech-challenge"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "db-15soat-tech-challenge" }
    }

    template {
      metadata {
        labels = { app = "db-15soat-tech-challenge" }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:18"

          env {
            name  = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }
          env {
            name  = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "POSTGRES_DB"
              }
            }
          }

          port {
            container_port = 5432
          }
        }
      }
    }
  }
  depends_on = [kubernetes_namespace.app]
}

resource "kubernetes_deployment" "app" {
  metadata {
    name      = "app-15soat-tech-challenge"
    namespace = kubernetes_namespace.app.metadata[0].name
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
              cpu               = "1m"
              memory            = "100Mi"
              ephemeral-storage = "2Gi"
            }
            limits = {
              cpu    = "2m"
              memory = "100Mi"
            }
          }

          port {
            container_port = 3000
          }

          env {
            name = "DB_NAME"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "POSTGRES_DB"
              }
            }
          }

          env {
            name = "DB_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "DB_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name = "DB_HOST"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "DB_HOST"
              }
            }
          }

          env {
            name = "DB_PORT"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "DB_PORT"
              }
            }
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app-secrets.metadata[0].name
                key  = "JWT_SECRET"
              }
            }
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_secret.app-secrets,
    kubernetes_deployment.db
  ]
}
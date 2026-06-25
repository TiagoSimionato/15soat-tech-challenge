resource "kubernetes_secret" "app-secrets" {
  metadata {
    name      = "secrets-15soat-tech-challenge"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  type = "Opaque"

  data = {
    POSTGRES_DB       = var.postgres_db
    POSTGRES_USER     = var.postgres_user
    POSTGRES_PASSWORD = var.postgres_password
    DB_HOST           = var.db_host
    DB_PORT           = var.db_port
    JWT_SECRET        = var.jwt_secret
  }
}
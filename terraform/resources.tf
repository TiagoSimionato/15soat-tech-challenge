# Cluster
resource "kind_cluster" "main" {
  name            = var.cluster_name
  wait_for_ready  = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
    }

    node {
      role = "worker"
    }
  }
}

# Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.namespace
  }

  depends_on = [kind_cluster.main]
}

# PostgreSQL
resource "kubernetes_deployment" "db" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "postgres" }
    }

    template {
      metadata {
        labels = { app = "postgres" }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:18"

          env {
            name  = "POSTGRES_USER"
            value = var.postgres_user
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = var.postgres_password
          }
          env {
            name  = "POSTGRES_DB"
            value = var.postgres_db
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

# Service do PostgreSQL
resource "kubernetes_service" "db" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = { app = "postgres" }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}
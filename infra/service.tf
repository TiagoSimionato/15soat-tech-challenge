resource "kubernetes_service" "db" {
  metadata {
    name      = "db-svc-15soat-tech-challenge"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = { app = "db-15soat-tech-challenge" }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }

  depends_on = [kubernetes_namespace.app]
}

resource "kubernetes_service" "app" {
  metadata {
    name      = "app-svc-15soat-tech-challenge"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = { app = "app-15soat-tech-challenge" }

    port {
      port        = 3000
      target_port = 3000
      node_port   = 30000
    }

    type = "NodePort"
  }

  depends_on = [kubernetes_namespace.app]
}
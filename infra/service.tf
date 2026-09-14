resource "kubernetes_service" "app" {
  metadata {
    name      = "app-svc-15soat-tech-challenge"
    namespace = var.namespace
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
}

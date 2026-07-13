resource "kubernetes_horizontal_pod_autoscaler_v2" "hpa-app" {
  metadata {
    name      = "hpa-app-15soat-tech-challenge"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = "app-15soat-tech-challenge"
    }

    min_replicas = 1
    max_replicas = 3

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 25
        }
      }
    }
  }

  depends_on = [kubernetes_namespace.app]
}

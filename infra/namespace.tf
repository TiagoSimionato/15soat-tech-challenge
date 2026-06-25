resource "kubernetes_namespace" "app" {
  metadata {
    name = var.namespace
  }

  depends_on = [kind_cluster.main]
}
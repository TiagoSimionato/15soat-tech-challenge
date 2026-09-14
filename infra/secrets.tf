resource "kubernetes_secret" "ghcr-secrets" {
  metadata {
    name      = "ghcr-secrets"
    namespace = var.namespace
  }

  type = "kubernetes.io/dockerconfigjson"

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "https://ghcr.io" = {
          username = var.ghcr_username
          password = var.ghcr_token
        }
      }
    })
  }
}

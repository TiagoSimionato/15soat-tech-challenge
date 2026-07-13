terraform {
  backend "local" {
    path = "/opt/terraform/terraform.tfstate"
  }
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.6"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }
}

provider "kind" {}

provider "kubernetes" {
  host                   = kind_cluster.main.endpoint
  client_certificate     = kind_cluster.main.client_certificate
  client_key             = kind_cluster.main.client_key
  cluster_ca_certificate = kind_cluster.main.cluster_ca_certificate
}

locals {
  metrics_server_raw = split("---", file("${path.module}/../k8s/metrics.yml"))

  metrics_server_docs = {
    for doc in local.metrics_server_raw :
    "${yamldecode(doc).kind}-${yamldecode(doc).metadata.name}" => yamldecode(doc)
    if trimspace(doc) != ""
  }
}

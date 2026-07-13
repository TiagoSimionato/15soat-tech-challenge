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

module "metrics_server" {
  source = "cookielab/metrics-server/kubernetes"
  version = "0.8.1"
}

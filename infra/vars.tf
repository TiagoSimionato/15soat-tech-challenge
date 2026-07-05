variable "cluster_name" {
  default = "soat-cluster"
}

variable "namespace" {
  default = "soat-grupo76"
}

variable "image"             {}
variable "postgres_user"     {}
variable "postgres_password" {}
variable "postgres_db"       {}
variable "jwt_secret"        {}
variable "ghcr_token"        {}
variable "ghcr_username"     {}
variable "db_host"           { default = "db-svc-15soat-tech-challenge" }
variable "db_port"           { default = "5432" }
variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "d1_database_id" {
  description = "D1 Database ID to bind"
  type        = string
}

variable "github_client_id" {
  description = "GitHub OAuth App Client ID"
  type        = string
  sensitive   = true
}

variable "github_client_secret" {
  description = "GitHub OAuth App Client Secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

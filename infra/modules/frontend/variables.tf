variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "api_url" {
  description = "API base URL for VITE_API_URL env var"
  type        = string
}

variable "d1_database_id" {
  description = "D1 Database ID for Pages binding"
  type        = string
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain for Pages (optional)"
  type        = string
  default     = ""
}

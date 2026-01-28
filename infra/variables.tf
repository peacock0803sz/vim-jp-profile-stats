variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be 'dev' or 'prod'."
  }
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

variable "custom_domain" {
  description = "Custom domain for Pages (optional)"
  type        = string
  default     = ""
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "peacock0803sz"
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "vim-jp-profile-stats"
}

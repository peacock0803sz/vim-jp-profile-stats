resource "cloudflare_pages_project" "frontend" {
  account_id        = var.account_id
  name              = "vim-jp-stats-${var.environment}"
  production_branch = "main"

  build_config {
    build_command   = "pnpm build"
    destination_dir = "dist"
    root_dir        = "frontend"
    build_caching   = true
  }

  source {
    type = "github"
    config {
      owner                          = var.github_repo_owner
      repo_name                      = var.github_repo_name
      production_branch              = "main"
      deployments_enabled            = true
      production_deployments_enabled = true
      pr_comments_enabled            = true
      preview_deployment_setting     = "custom"
      preview_branch_includes        = ["react-router", "feature/*"]
    }
  }

  deployment_configs {
    production {
      compatibility_date = "2025-01-01"
      env_vars = {
        VITE_API_URL = {
          type  = "plain_text"
          value = var.api_url
        }
        NODE_ENV = {
          type  = "plain_text"
          value = "production"
        }
      }
      d1_databases = {
        DB = {
          id = var.d1_database_id
        }
      }
    }
    preview {
      compatibility_date = "2025-01-01"
      env_vars = {
        VITE_API_URL = {
          type  = "plain_text"
          value = "https://vim-jp-api-dev.workers.dev"
        }
        NODE_ENV = {
          type  = "plain_text"
          value = "development"
        }
      }
    }
  }
}

resource "cloudflare_pages_domain" "custom" {
  count        = var.custom_domain != "" ? 1 : 0
  account_id   = var.account_id
  project_name = cloudflare_pages_project.frontend.name
  domain       = var.custom_domain
}

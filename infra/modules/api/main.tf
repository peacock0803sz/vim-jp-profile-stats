resource "cloudflare_workers_script" "api" {
  account_id  = var.account_id
  script_name = "vim-jp-api-${var.environment}"
  main_module = "index.js"
  content     = file("${path.module}/../../../api/dist/index.js")

  compatibility_date  = "2025-01-01"
  compatibility_flags = ["nodejs_compat"]

  bindings = [
    {
      name = "DB"
      type = "d1"
      id   = var.d1_database_id
    },
    {
      name = "GITHUB_CLIENT_ID"
      type = "secret_text"
      text = var.github_client_id
    },
    {
      name = "GITHUB_CLIENT_SECRET"
      type = "secret_text"
      text = var.github_client_secret
    },
    {
      name = "JWT_SECRET"
      type = "secret_text"
      text = var.jwt_secret
    },
    {
      name = "ENVIRONMENT"
      type = "plain_text"
      text = var.environment
    }
  ]

  placement {
    mode = "smart"
  }

  observability {
    enabled = true
    logs {
      enabled         = true
      invocation_logs = var.environment == "dev"
    }
  }
}

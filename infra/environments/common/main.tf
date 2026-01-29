module "database" {
  source = "../../modules/database"

  account_id  = var.cloudflare_account_id
  environment = local.environment
}

module "api" {
  source = "../../modules/api"

  account_id           = var.cloudflare_account_id
  environment          = local.environment
  d1_database_id       = module.database.d1_database_id
  github_client_id     = var.github_client_id
  github_client_secret = var.github_client_secret
  jwt_secret           = var.jwt_secret
}

module "frontend" {
  source = "../../modules/frontend"

  account_id        = var.cloudflare_account_id
  environment       = local.environment
  api_url           = module.api.api_url
  d1_database_id    = module.database.d1_database_id
  github_repo_owner = local.github_repo_owner
  github_repo_name  = local.github_repo_name
  custom_domain     = local.custom_domain
}

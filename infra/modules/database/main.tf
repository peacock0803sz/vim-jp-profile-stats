resource "cloudflare_d1_database" "main" {
  account_id            = var.account_id
  name                  = "vim-jp-profile-stats-${var.environment}"
  primary_location_hint = "apac"
}

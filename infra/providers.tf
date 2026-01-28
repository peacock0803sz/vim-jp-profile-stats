terraform {
  required_version = ">= 1.9.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.16"
    }
  }

  # Cloudflare R2 (S3互換) を remote backend として使用
  # 認証情報は backend.hcl または環境変数で設定:
  #   terraform init -backend-config=backend.hcl
  backend "s3" {
    bucket = "vim-jp-terraform-state"
    region = "auto"

    # R2 互換設定
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

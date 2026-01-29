terraform {
  required_version = "~> 1.14.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.16"
    }
  }

  # Cloudflare R2 (S3互換) を remote backend として使用
  # 認証情報は環境変数で設定:
  #   export AWS_ACCESS_KEY_ID="your_r2_access_key"
  #   export AWS_SECRET_ACCESS_KEY="your_r2_secret_key"
  #   export AWS_ENDPOINT_URL_S3="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
  backend "s3" {
    bucket = "vim-jp-profile-stats"
    key    = "prod/terraform.tfstate"
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

config {
  call_module_type = "local"
}

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

plugin "cloudflare" {
  enabled = true
  version = "0.9.0"
  source  = "github.com/cloudflare/tflint-ruleset-cloudflare"
}

rule "terraform_naming_convention" {
  enabled = true
}

rule "terraform_documented_variables" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = true
}

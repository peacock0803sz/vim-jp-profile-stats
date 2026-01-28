output "script_name" {
  description = "Workers script name"
  value       = cloudflare_workers_script.api.script_name
}

output "api_url" {
  description = "API URL"
  value       = "https://${cloudflare_workers_script.api.script_name}.workers.dev"
}

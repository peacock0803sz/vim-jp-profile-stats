output "project_name" {
  description = "Pages project name"
  value       = cloudflare_pages_project.frontend.name
}

output "subdomain" {
  description = "Pages subdomain URL"
  value       = cloudflare_pages_project.frontend.subdomain
}

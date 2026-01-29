output "d1_database_id" {
  description = "D1 Database ID"
  value       = module.database.d1_database_id
}

output "api_url" {
  description = "API URL"
  value       = module.api.api_url
}

output "workers_script_name" {
  description = "Workers script name"
  value       = module.api.script_name
}

output "pages_project_name" {
  description = "Pages project name"
  value       = module.frontend.project_name
}

output "pages_subdomain" {
  description = "Pages subdomain URL"
  value       = module.frontend.subdomain
}

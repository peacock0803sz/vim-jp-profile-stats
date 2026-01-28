output "d1_database_id" {
  description = "D1 Database ID"
  value       = cloudflare_d1_database.main.id
}

output "d1_database_name" {
  description = "D1 Database name"
  value       = cloudflare_d1_database.main.name
}

use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :football, Football.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :football, Football.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "football_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# Configure guardian authentication
config :guardian, Guardian,
  allowed_algos: ["HS512"],
  verify_module: Guardian.JWT,
  issuer: "Football",
  ttl: { 30, :days },
  verify_issuer: true,
  secret_key: "test private key",
  serializer: Football.GuardianSerializer

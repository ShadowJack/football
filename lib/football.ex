defmodule Football do
  @moduledoc """
  Starting module for OTP application
  """

  use Application

  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    lobbies_registry_name = Application.get_env(:football, :lobbies_registry_name, :lobbies_registry)
    children = [
      supervisor(Football.Repo, []),
      supervisor(Football.Endpoint, []),
      supervisor(Football.Lobby.LobbiesSupervisor, []),
      supervisor(Registry, [:unique, lobbies_registry_name]),
      supervisor(Football.Presence, [])
    ]

    opts = [strategy: :one_for_one, name: Football.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Football.Endpoint.config_change(changed, removed)
    :ok
  end
end

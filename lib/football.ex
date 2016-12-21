defmodule Football do
  @moduledoc """
  Starting module for OTP application
  """

  use Application

  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      supervisor(Football.Repo, []),
      supervisor(Football.Endpoint, []),
      worker(Football.Lobby.LobbiesManager, []),
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

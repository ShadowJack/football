defmodule Football.MainLobbyChannel do
  @moduledoc """
  Channel that manages operations in the
  main lobby
  """

  require Logger

  use Football.Web, :channel

  alias Football.Lobby.LobbiesSupervisor

  def join("main_lobby:lobby", _payload, socket) do
    resp = %{game_lobbies: get_open_lobbies()}
    Logger.info("User joined: #{Guardian.Phoenix.Socket.current_resource(socket)}")
    {:ok, resp, socket}
  end

  def handle_in("lobby:add", %{"name" => name}, socket) do
    case LobbiesSupervisor.add_lobby(name) do
      {:ok, lobby} -> 
        broadcast!(socket, "lobby:added", lobby)
        {:reply, :ok, socket}
      {:error, reason} ->
        {:reply, {:error, %{"reason" => reason}}, socket}
    end
  end

  defp get_open_lobbies() do
    LobbiesSupervisor.get_lobbies(fn l -> l.status == :open end)
  end
end

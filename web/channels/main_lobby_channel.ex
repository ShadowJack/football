defmodule Football.MainLobbyChannel do
  @moduledoc """
  Channel that manages operations in the
  main lobby
  """

  require Logger

  use Football.Web, :channel

  alias Football.Lobby.LobbiesManager

  def join("main_lobby:lobby", _payload, socket) do
    resp = %{game_lobbies: LobbiesManager.get_all_lobbies()}
    Logger.info("User joined: #{Guardian.Phoenix.Socket.current_resource(socket)}")
    {:ok, resp, socket}
  end

  def handle_in("lobby:add", %{"name" => name}, socket) do
    case LobbiesManager.add_lobby(name) do
      {:ok, lobby} -> 
        broadcast!(socket, "lobby:added", %{"id" => lobby.id, "name" => name, "created_at" => lobby.created_at})
        {:reply, :ok, socket}
      {:error, reason} ->
        {:reply, {:error, %{"reason" => reason}}, socket}
    end
  end
end

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

  @doc """
  Notifies all users about updated lobby status
  """
  def handle_lobby_status_update(updated_lobby) do
    Football.Endpoint.broadcast!("main_lobby:lobby", "lobby:status_updated", %{id: updated_lobby.id, new_status: updated_lobby.status})
  end

  @doc """
  Notifies all users that lobby was removed
  """
  def handle_lobby_removed(removed_lobby_id) do
    Football.Endpoint.broadcast!("main_lobby:lobby", "lobby:removed", %{id: removed_lobby_id})
  end

  defp get_open_lobbies() do
    LobbiesSupervisor.get_lobbies(fn l -> l.status == :open end)
  end
end

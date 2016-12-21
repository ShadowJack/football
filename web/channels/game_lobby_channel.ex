defmodule Football.GameLobbyChannel do
  @moduledoc """
  Channel that handles communication inside a
  game lobby
  """

  use Football.Web, :channel


  # TODO: use Presence to send info about connected users
  @doc """
  Connect to specific lobby by `lobby_id`
  """
  def join("game_lobby:" <> lobby_id, _payload, socket) do
    resp = case Football.Lobby.LobbiesManager.get_lobby(lobby_id) do
      {:ok, lobby} -> 
        send(self, :after_join)
        {:ok, %{lobby: lobby}, socket} 
      {:error, reason} -> {:error, %{reason: reason}}
    end
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = Football.Presence.track(socket, Guardian.Phoenix.Socket.current_resource(socket), %{})
    push(socket, "presence_state", Football.Presence.list(socket))
    {:noreply, socket}
  end
end

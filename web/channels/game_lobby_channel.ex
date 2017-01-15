defmodule Football.GameLobbyChannel do
  @moduledoc """
  Channel that handles communication inside a
  game lobby
  """

  use Football.Web, :channel

  @doc """
  Connect to specific lobby by `lobby_id`
  """
  def join("game_lobby:" <> lobby_id, _payload, socket) do
    case Football.Lobby.LobbiesManager.get_lobby(lobby_id) do
      {:ok, lobby} -> 
        send(self(), :after_join)
        {:ok, %{lobby: lobby}, socket} 
      {:error, reason} -> 
        {:error, %{reason: reason}}
    end
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = Football.Presence.track(socket, Guardian.Phoenix.Socket.current_resource(socket), %{})
    push(socket, "presence_state", Football.Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("signalling:sdp", %{"peerId" => peerId, "desc" => description}, socket) do
    payload = %{
      from: Guardian.Phoenix.Socket.current_resource(socket),
      to: peerId,
      sdp: description
    }
    broadcast!(socket, "signalling:sdp", payload)
    {:noreply, socket}
  end

  def handle_in("signalling:ice", %{"peerId" => peerId, "candidate" => candidate}, socket) do
    payload = %{
      from: Guardian.Phoenix.Socket.current_resource(socket),
      to: peerId,
      iceCandidate: candidate
    }
    broadcast!(socket, "signalling:ice", payload)
    {:noreply, socket}
  end
end

defmodule Football.GameLobbyChannel do
  @moduledoc """
  Channel that handles communication inside a
  game lobby
  """

  use Football.Web, :channel
  alias Football.Lobby

  @doc """
  Connect to specific lobby by `lobby_id`
  """
  def join("game_lobby:" <> lobby_id, _payload, socket) do
    case Lobby.add_user(lobby_id, self()) do
      {:ok, lobby} ->
        send(self(), :after_join)
        {:ok, %{lobby: lobby}, socket}
      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_info(:after_join, socket) do
    Football.Presence.track(socket, Guardian.Phoenix.Socket.current_resource(socket), %{status: "connected"})
    push(socket, "presence_state", Football.Presence.list(socket))

    {:noreply, socket}
  end

  def handle_in("player:status_changed", %{"status" => "ready_to_play"}, socket) do
    Football.Presence.update(socket, Guardian.Phoenix.Socket.current_resource(socket), %{status: "ready_to_play"})

    # check if all players in the room are ready to play
    Football.Presence.list(socket)
    |> Enum.map(fn {user_id, %{metas: [meta | _rest]}} -> meta.status end)
    |> Enum.all?(fn status -> status == "ready_to_play" end)
    |> if(do: broadcast!(socket, "game_is_ready", %{}))

    {:noreply, socket}
  end

  def handle_in("player:status_changed", %{"status" => any_status}, socket) do
    {:noreply, socket}
  end

  ##
  # WebRTC signalling infrastructure
  def handle_in("signalling:sdp", %{"peerId" => peer_id, "desc" => description}, socket) do
    payload = %{
      from: Guardian.Phoenix.Socket.current_resource(socket),
      to: peer_id,
      sdp: description
    }
    broadcast!(socket, "signalling:sdp", payload)
    {:noreply, socket}
  end

  def handle_in("signalling:ice", %{"peerId" => peer_id, "candidate" => candidate}, socket) do
    payload = %{
      from: Guardian.Phoenix.Socket.current_resource(socket),
      to: peer_id,
      iceCandidate: candidate
    }
    broadcast!(socket, "signalling:ice", payload)
    {:noreply, socket}
  end
end

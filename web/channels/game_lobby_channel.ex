defmodule Football.GameLobbyChannel do
  @moduledoc """
  Channel that handles communication inside a
  game lobby
  """

  use Football.Web, :channel

  @max_players 8

  @doc """
  Connect to specific lobby by `lobby_id`
  """
  def join("game_lobby:" <> lobby_id, _payload, socket) do
    case Football.Lobby.LobbiesSupervisor.get_lobby(lobby_id) do
      {:ok, lobby} ->
        send(self(), :after_join)
        {:ok, %{lobby: lobby}, socket}
      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = Football.Presence.track(socket, Guardian.Phoenix.Socket.current_resource(socket), %{})
    presence_state = Football.Presence.list(socket)

    players_count = presence_state |> Map.keys() |> Enum.count()
    if players_count >= @max_players do
    #TODO: change status of lobby
    #Football.Lobby.LobbiesManager.
    end

    push(socket, "presence_state", presence_state)
    {:noreply, socket}
  end

  ##
  # WebRTC signalling infrastructure
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
